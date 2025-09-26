/*
  # SkillSwap Initial Database Schema

  1. New Tables
    - `profiles` - User profiles with credit system and location
    - `skills` - Skills offered by users with AI embeddings
    - `swaps` - Skill exchange requests and tracking
    - `chats` - Chat conversations between users
    - `messages` - Individual chat messages with real-time support
    - `transactions` - Credit transfer history
    - `reviews` - User ratings and feedback system

  2. Security
    - Enable RLS on all tables
    - Add comprehensive security policies
    - Implement secure credit transfer functions

  3. Features
    - PostGIS for geospatial queries
    - Vector embeddings for AI recommendations
    - Real-time chat support
    - Secure credit system
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS vector;

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    username TEXT UNIQUE,
    bio TEXT,
    avatar_url TEXT,
    credits INTEGER DEFAULT 100 CHECK (credits >= 0),
    is_ngo_volunteer BOOLEAN DEFAULT FALSE,
    location_name TEXT,
    location_coordinates GEOMETRY(POINT, 4326),
    skills_taught INTEGER DEFAULT 0,
    skills_learned INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skills table with AI embeddings
CREATE TABLE IF NOT EXISTS skills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    credits_per_hour INTEGER NOT NULL CHECK (credits_per_hour > 0),
    max_duration_hours INTEGER DEFAULT 2,
    is_active BOOLEAN DEFAULT TRUE,
    location_coordinates GEOMETRY(POINT, 4326),
    location_name TEXT,
    embedding VECTOR(1536),
    tags TEXT[],
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Swaps table for skill exchanges
CREATE TABLE IF NOT EXISTS swaps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE NOT NULL,
    teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    learner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'declined', 'cancelled')),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    duration_hours INTEGER NOT NULL,
    total_credits INTEGER NOT NULL,
    message TEXT,
    meeting_type TEXT CHECK (meeting_type IN ('in_person', 'online', 'hybrid')),
    meeting_details JSONB,
    completion_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chats table
CREATE TABLE IF NOT EXISTS chats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    swap_id UUID REFERENCES swaps(id) ON DELETE CASCADE,
    participant_1 UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    participant_2 UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(participant_1, participant_2)
);

-- Messages table with real-time support
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_id UUID REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
    file_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table for credit history
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    from_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    to_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    swap_id UUID REFERENCES swaps(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('swap_payment', 'signup_bonus', 'referral_bonus', 'admin_adjustment')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table for ratings and feedback
CREATE TABLE IF NOT EXISTS reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    swap_id UUID REFERENCES swaps(id) ON DELETE CASCADE NOT NULL,
    reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    reviewee_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    review_type TEXT NOT NULL CHECK (review_type IN ('as_teacher', 'as_learner')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(swap_id, reviewer_id, review_type)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_skills_user_id ON skills(user_id);
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
CREATE INDEX IF NOT EXISTS idx_skills_location ON skills USING GIST(location_coordinates);
CREATE INDEX IF NOT EXISTS idx_skills_active ON skills(is_active);
CREATE INDEX IF NOT EXISTS idx_swaps_teacher_id ON swaps(teacher_id);
CREATE INDEX IF NOT EXISTS idx_swaps_learner_id ON swaps(learner_id);
CREATE INDEX IF NOT EXISTS idx_swaps_status ON swaps(status);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_users ON transactions(from_user_id, to_user_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE swaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Skills policies
CREATE POLICY "Active skills are viewable by everyone" ON skills
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can manage own skills" ON skills
    FOR ALL USING (auth.uid() = user_id);

-- Swaps policies
CREATE POLICY "Users can view swaps they're involved in" ON swaps
    FOR SELECT USING (auth.uid() = teacher_id OR auth.uid() = learner_id);

CREATE POLICY "Users can create swap requests" ON swaps
    FOR INSERT WITH CHECK (auth.uid() = learner_id);

CREATE POLICY "Users can update their swaps" ON swaps
    FOR UPDATE USING (auth.uid() = teacher_id OR auth.uid() = learner_id);

-- Chat policies
CREATE POLICY "Users can view their chats" ON chats
    FOR SELECT USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

CREATE POLICY "Users can create chats" ON chats
    FOR INSERT WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Messages policies
CREATE POLICY "Users can view messages from their chats" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chats 
            WHERE chats.id = messages.chat_id 
            AND (chats.participant_1 = auth.uid() OR chats.participant_2 = auth.uid())
        )
    );

CREATE POLICY "Users can send messages to their chats" ON messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM chats 
            WHERE chats.id = messages.chat_id 
            AND (chats.participant_1 = auth.uid() OR chats.participant_2 = auth.uid())
        )
    );

-- Transactions policies
CREATE POLICY "Users can view their transactions" ON transactions
    FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone" ON reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can create reviews for their swaps" ON reviews
    FOR INSERT WITH CHECK (
        auth.uid() = reviewer_id AND
        EXISTS (
            SELECT 1 FROM swaps 
            WHERE swaps.id = swap_id 
            AND (swaps.teacher_id = auth.uid() OR swaps.learner_id = auth.uid())
            AND swaps.status = 'completed'
        )
    );

-- Geospatial search function
CREATE OR REPLACE FUNCTION search_skills_nearby(
    user_lat FLOAT,
    user_lng FLOAT,
    radius_km FLOAT DEFAULT 50,
    skill_category TEXT DEFAULT NULL,
    limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    category TEXT,
    credits_per_hour INTEGER,
    user_name TEXT,
    user_avatar TEXT,
    distance_km FLOAT,
    location_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.title,
        s.description,
        s.category,
        s.credits_per_hour,
        p.full_name as user_name,
        p.avatar_url as user_avatar,
        ST_Distance(
            s.location_coordinates::geography,
            ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
        ) / 1000 as distance_km,
        s.location_name
    FROM skills s
    JOIN profiles p ON s.user_id = p.id
    WHERE s.is_active = true
    AND (skill_category IS NULL OR s.category = skill_category)
    AND s.location_coordinates IS NOT NULL
    AND ST_DWithin(
        s.location_coordinates::geography,
        ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
        radius_km * 1000
    )
    ORDER BY distance_km
    LIMIT limit_count;
END;
$$;

-- Credit transfer function
CREATE OR REPLACE FUNCTION handle_swap_completion(swap_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    swap_record swaps%ROWTYPE;
    result JSONB;
BEGIN
    -- Get swap details
    SELECT * INTO swap_record FROM swaps WHERE id = swap_uuid;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Swap not found');
    END IF;
    
    IF swap_record.status != 'in_progress' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Swap is not in progress');
    END IF;
    
    -- Check authorization
    IF auth.uid() != swap_record.teacher_id AND auth.uid() != swap_record.learner_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
    END IF;
    
    -- Transfer credits and update stats
    BEGIN
        -- Check learner has sufficient credits
        IF (SELECT credits FROM profiles WHERE id = swap_record.learner_id) < swap_record.total_credits THEN
            RETURN jsonb_build_object('success', false, 'error', 'Insufficient credits');
        END IF;
        
        -- Transfer credits
        UPDATE profiles 
        SET credits = credits - swap_record.total_credits 
        WHERE id = swap_record.learner_id;
        
        UPDATE profiles 
        SET credits = credits + swap_record.total_credits,
            skills_taught = skills_taught + 1
        WHERE id = swap_record.teacher_id;
        
        UPDATE profiles
        SET skills_learned = skills_learned + 1
        WHERE id = swap_record.learner_id;
        
        -- Update swap status
        UPDATE swaps 
        SET status = 'completed', updated_at = NOW() 
        WHERE id = swap_uuid;
        
        -- Log transaction
        INSERT INTO transactions (from_user_id, to_user_id, swap_id, amount, transaction_type, description)
        VALUES (
            swap_record.learner_id, 
            swap_record.teacher_id, 
            swap_uuid, 
            swap_record.total_credits, 
            'swap_payment',
            'Payment for completed skill swap'
        );
        
        result := jsonb_build_object('success', true, 'message', 'Swap completed successfully');
        
    EXCEPTION WHEN OTHERS THEN
        result := jsonb_build_object('success', false, 'error', SQLERRM);
    END;
    
    RETURN result;
END;
$$;