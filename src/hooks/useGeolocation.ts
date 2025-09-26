import { useState, useEffect } from 'react'
import type { Location } from '../types'

interface GeolocationState {
  location: Location | null
  loading: boolean
  error: string | null
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    loading: false,
    error: null
  })

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by this browser',
        loading: false
      }))
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          },
          loading: false,
          error: null
        })
      },
      (error) => {
        let errorMessage = 'Failed to get location'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out'
            break
        }

        setState({
          location: null,
          loading: false,
          error: errorMessage
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 300000 // 5 minutes
      }
    )
  }

  const setManualLocation = (lat: number, lng: number, name?: string) => {
    setState({
      location: { lat, lng, name },
      loading: false,
      error: null
    })
  }

  const clearLocation = () => {
    setState({
      location: null,
      loading: false,
      error: null
    })
  }

  return {
    ...state,
    getCurrentLocation,
    setManualLocation,
    clearLocation
  }
}