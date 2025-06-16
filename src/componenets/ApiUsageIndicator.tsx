import * as React from 'react'
import { useAuth } from '@/contexts/use-auth'

type ApiUsageIndicatorProps = {
  className?: string
}

/**
 * Component to display the user's API usage and remaining requests
 */
const ApiUsageIndicator = ({ className = '' }: ApiUsageIndicatorProps): React.JSX.Element | null => {
  const { isAuthenticated, isAuthorized, requestsRemaining } = useAuth()
  console.log(requestsRemaining)

  // Don't show anything if user is not authenticated or not authorized
  if (!isAuthenticated || !isAuthorized) {
    return null
  }

  // Handle loading state
  if (requestsRemaining === null) {
    return (
      <div className={`flex items-center justify-center text-lg ${className}`}>
        <span className="text-gray-500">Loading API usage...</span>
      </div>
    )
  }

  // Determine color based on remaining requests
  const getStatusColor = (): string => {
    if (requestsRemaining <= 0) return 'text-red-600'
    if (requestsRemaining <= 5) return 'text-amber-500'
    return 'text-green-600'
  }

  return (
    <div className={`flex flex-col items-center justify-center text-lg ${className}`}>
      <div className="flex items-center">
        <span>and&nbsp;</span>
        <span className={getStatusColor()}>
          {import.meta.env.VITE_MAX_API_REQUESTS_PER_MONTH - requestsRemaining}/
          {import.meta.env.VITE_MAX_API_REQUESTS_PER_MONTH}
        </span>
        <span>&nbsp;this month</span>
      </div>
      {requestsRemaining <= 0 && <div className="text-red-600">Limit reached. Resets on the 1st of next month.</div>}
    </div>
  )
}

export { ApiUsageIndicator }
