import React from 'react';

const ErrorMessage = ({ message }) => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh', // Takes full viewport height for vertical centering
        }}>
            <div style={{
                color: 'red', 
                padding: '10px 20px', 
                border: '1px solid red', 
                backgroundColor: '#ffe6e6', 
                borderRadius: '5px',
                textAlign: 'center',
                maxWidth: '400px', // Sets a max width for readability
                width: '100%', // Makes the box responsive
            }}>
                <p style={{margin: '0px'}}><strong>Error:</strong> {message}</p>
            </div>
        </div>
    );
};

export default ErrorMessage;