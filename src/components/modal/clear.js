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

  const positionsRef = useRef([]);

  useEffect(() => {
    positionsRef.current = [];

    const unsubscribers = boxApi.map((box, index) =>
      box.api.position.subscribe(([x, y]) => {
        positionsRef.current[index] = [x, y];
      })
    );

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [boxApi]);

  const getResultRows = useCallback(() => {
    const indexedBoxes = positionsRef.current
      .map((pos, apiIndex) => ({ pos, apiIndex }))
      .filter(({ pos }) => {
        return pos && pos[1] < -5 + 16;
      })
      .map(({ pos, apiIndex }) => {
        return {
          apiIndex,
          boxIndex: Math.round(pos[0] / 2.0) + 5 * Math.round(pos[1] / 2.0),
        };
      });

    if (indexedBoxes.length === 0) {
      return [];
    }

    const minIndex = Math.min(...indexedBoxes.map(({ boxIndex }) => boxIndex));
    const normalizedBoxes = indexedBoxes.map(({ apiIndex, boxIndex }) => ({
      apiIndex,
      boxIndex: boxIndex - minIndex,
    }));

    const maxIndex = Math.max(
      ...normalizedBoxes.map(({ boxIndex }) => boxIndex)
    );
    const resultBoxes = Array.from({ length: maxIndex + 1 }, (_, idx) => {
      const apiIndex = normalizedBoxes.find(
        ({ boxIndex }) => boxIndex === idx
      )?.apiIndex;
      if (apiIndex === undefined) {
        return '◽';
      }

      const obj = boxApi[apiIndex];
      if (!obj?.mat?.current) {
        return '◽';
      }

      if (COLOR_CLEAR.equals(obj.mat.current.color)) {
        return '🟩';
      } else if (COLOR_INCORRECT.equals(obj.mat.current.color)) {
        return '🟨';
      } else {
        return '⬛';
      }
    });

    const length = Math.ceil(resultBoxes.length / 5);
    return new Array(length)
      .fill(null)
      .map((_, i) => resultBoxes.slice(i * 5, (i + 1) * 5).join(''));
  }, [boxApi]);

  useEffect(() => {
    if (clear === 'clear' || clear === 'failed') {
      const rows = getResultRows().reverse();
      if (rows.length > 0) {
        setResultText(rows);
      }
    }
  }, [clear, getResultRows, setResultText]);

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
      const currentRows = getResultRows().reverse();
      const rows = currentRows.length > 0 ? currentRows : resultText;

      if (currentRows.length > 0) {
        setResultText(currentRows);
      }

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
        rows.join('\n') +
        '\n\n' +
        'https://k1mny.github.io/wor3dle/';

      copyTextToClipboard(resultTextClip);
      setAnchorEl(event.currentTarget);
    },
    [
      clearRowText,
      copyTextToClipboard,
      getResultRows,
      resultText,
      setResultText,
    ]
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
