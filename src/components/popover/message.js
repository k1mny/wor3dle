import { Box } from '@mui/material';
import React, { useEffect } from 'react';
import { useAtom } from 'jotai';
import { useWrongMessageState } from '../states';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function PopoverMessage(props) {
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
