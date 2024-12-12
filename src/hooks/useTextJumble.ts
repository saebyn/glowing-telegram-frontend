import { type RefObject, useEffect } from 'react';

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ-0123456789';

const randomLetter = () => {
  const index = Math.floor(Math.random() * 26);
  return letters[index];
};

function startTextJumble(element: HTMLElement, originalText: string) {
  let iterations = -10;

  const interval = setInterval(() => {
    element.innerText = element.innerText
      .split('')
      .map((letter, index) => {
        if (index < iterations + 1) {
          return originalText[index];
        }

        if (letters.includes(letter.toUpperCase())) return randomLetter();
        return letter;
      })
      .join('');

    iterations += 1 / 3;
    if (iterations >= originalText.length) {
      clearInterval(interval);
      element.innerText = originalText;
    }
  }, 30);

  return function cancel() {
    clearInterval(interval);
  };
}

export default function useTextJumble(ref: RefObject<HTMLElement>) {
  let originalText: string | null = null;

  useEffect(() => {
    if (!ref.current) return;

    if (!originalText) {
      originalText = ref.current.innerText;
    }

    let cancel = startTextJumble(ref.current, originalText);

    const interval = setInterval(() => {
      if (ref.current && originalText) {
        cancel = startTextJumble(ref.current, originalText);
      }
    }, 8000);

    return () => {
      clearInterval(interval);

      if (cancel) {
        cancel();
      }
    };
  }, [originalText, ref]);
}
