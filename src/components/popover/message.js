import { Box } from '@mui/material';
import React, { useEffect } from 'react';
import { useAtom } from 'jotai';
import { useWrongMessageState } from '../states';

export default function PopoverMessage() {
  const [wrongMessage, setWrongMessage] = useAtom(useWrongMessageState);
  const open = wrongMessage.length > 0;

  useEffect(() => {
    if (wrongMessage.length > 0) {
      const timeoutId = setTimeout(() => {
        setWrongMessage('');
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [setWrongMessage, wrongMessage]);

  return (
    <>
      {open && (
        <Box
          position="absolute"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '5',
            height: '20px',
            width: '100vw',
            mt: '20px',
          }}
        >
          <Box
            sx={{
              background: 'rgba(0, 0, 0, .8)',
              color: 'white',
              p: '10px',
              borderRadius: '10px',
            }}
          >
            {wrongMessage}
          </Box>
        </Box>
      )}
    </>
  );
}
