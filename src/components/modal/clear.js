import {
  Box,
  Button,
  Divider,
  Modal,
  Popover,
  Typography,
} from '@mui/material';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { COLOR_CLEAR, COLOR_INCORRECT } from '../constants';
import { getWordleAnswer } from '../logic';
import {
  useBoxApiState,
  useClearState,
  useCountInputState,
  useWordInputState,
  useWordleResultTextState,
} from '../states';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxWidth: '400px',
  bgcolor: 'background.paper',
  backgroundColor: 'rgba(18, 18, 18, .8)',
  color: 'white',
  border: '2px solid #000',
  borderRadius: '10px',
  boxShadow: 24,
  p: 4,
};

const date = new Date();
const [month, day, year] = [
  date.getMonth() + 1,
  date.getDate(),
  date.getFullYear(),
];

export default function ModalClear() {
  const clear = useAtomValue(useClearState);
  const boxApi = useAtomValue(useBoxApiState);
  const wordInput = useAtomValue(useWordInputState);
  const [resultText, setResultText] = useAtom(useWordleResultTextState);
  const [countInput, setCountInput] = useAtom(useCountInputState);
  const [anchorEl, setAnchorEl] = useState(null);

  const ref = useRef([]);

  useEffect(() => {
    // make index of current box position
    boxApi.forEach((box, index) =>
      box.api.position.subscribe((p) => (ref.current[index] = [p[0], p[1]]))
    );
    const boxIndex = ref.current
      .filter((val) => {
        return val[1] < -5 + 16;
      })
      .map((pos) => {
        return Math.round(pos[0] / 2.0) + 5 * Math.round(pos[1] / 2.0);
      })
      .map((i, _, self) => {
        return i + Math.abs(Math.min(...self));
      });
    if (boxIndex.length === 0) {
      return [];
    }

    // make result text
    let resultBoxes = Array.apply(null, Array(Math.max(...boxIndex) + 1));
    resultBoxes = resultBoxes.map((_, idx) => {
      const apiPos = boxIndex.findIndex((val) => val === idx);
      if (apiPos === -1) {
        return '◽';
      }
      const obj = boxApi[apiPos];
      if (COLOR_CLEAR.equals(obj.mat.current.color)) {
        return '🟩';
      } else if (COLOR_INCORRECT.equals(obj.mat.current.color)) {
        return '🟨';
      } else {
        return '⬛';
      }
    });
    const length = Math.ceil(resultBoxes.length / 5);
    const rows = new Array(length)
      .fill()
      .map((_, i) => resultBoxes.slice(i * 5, (i + 1) * 5).join(''));
    setResultText(rows.reverse());
  }, [boxApi, anchorEl, clear, setResultText]);

  const copyTextToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text).then(
      function () {
        console.log('Copied!');
      },
      function (err) {
        console.error('Could not copy text: ', err);
      }
    );
  }, []);

  useEffect(() => {
    if (clear !== 'clear' && clear !== 'failed') {
      setCountInput((boxApi.length - wordInput.length) / 5);
    }
  }, [boxApi, clear, setCountInput, wordInput]);

  const clearRowText =
    clear === 'clear' ? countInput.toString() + '/6' : 'X/6 ';

  const handleClick = useCallback(
    (event) => {
      const resultTextClip =
        'WOR3DLE ' +
        year +
        '/' +
        month +
        '/' +
        day +
        '\n' +
        clearRowText +
        '\n\n' +
        resultText.join('\n') +
        '\n\n' +
        'https://k1mny.github.io/wor3dle/';

      copyTextToClipboard(resultTextClip);
      setAnchorEl(event.currentTarget);
    },
    [clearRowText, copyTextToClipboard, resultText]
  );

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <Modal
      open={clear === 'clear' || clear === 'failed'}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography
          id="modal-modal-title"
          variant="h6"
          component="h2"
          align="center"
        >
          WOR3DLE {year + '/' + month + '/' + day}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Box id="modal-modal-description" sx={{ my: 3 }}>
            {clear !== 'clear' && (
              <Typography align="center" sx={{ mb: 2 }}>
                answer: {getWordleAnswer()}
              </Typography>
            )}
            <Typography align="center">{clearRowText}</Typography>
            {resultText.map((row, idx) => (
              <div key={idx}>{row}</div>
            ))}
          </Box>
          <Divider />
          <Button
            variant="outlined"
            aria-describedby={id}
            onClick={handleClick}
          >
            share
          </Button>
          <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
          >
            <Typography sx={{ p: 2 }}>Copied to clipboard!</Typography>
          </Popover>
        </Box>
      </Box>
    </Modal>
  );
}
