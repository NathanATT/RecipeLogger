import React, { useState } from 'react';
import type { ApiError } from '../types'; 


interface DetailedErrorToastProps {
  userMessage: string;
  technicalError?: ApiError | Error;
}

const DetailedErrorToast: React.FC<DetailedErrorToastProps> = ({ userMessage, technicalError }) => {
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);

  const getErrorDetails = () => {
    if (!technicalError) return '';
    
    // Check if it's an Axios error with a response object
    if ('response' in technicalError && (technicalError as ApiError).response?.data) {
      return JSON.stringify((technicalError as ApiError).response?.data, null, 2);
    }
    
    return technicalError.message;
  };

  return (
    <div>
      <p style={{ margin: 0, padding: 0 }}>{userMessage}</p>
      {technicalError && (
        <button 
          onClick={(e) => {
            e.stopPropagation(); // Prevent the toast from closing when the button is clicked
            setIsDetailsVisible(!isDetailsVisible);
          }}
          style={{ 
            background: 'none', 
            border: '1px solid rgba(255, 255, 255, 0.3)', 
            borderRadius: '4px', 
            color: 'white', 
            cursor: 'pointer', 
            marginTop: '10px',
            padding: '4px 8px',
            fontSize: '12px'
          }}
        >
          {isDetailsVisible ? 'Hide Details' : 'View Details'}
        </button>
      )}
      {isDetailsVisible && (
        <pre style={{ 
          background: 'rgba(0, 0, 0, 0.2)', 
          padding: '10px', 
          marginTop: '10px', 
          fontSize: '12px', 
          whiteSpace: 'pre-wrap', 
          wordBreak: 'break-all',
          maxHeight: '150px',
          overflowY: 'auto',
          borderRadius: '4px'
        }}>
          <code>{getErrorDetails()}</code>
        </pre>
      )}
    </div>
  );
};

export default DetailedErrorToast;