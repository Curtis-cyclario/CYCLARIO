/**
 * Calculates the Fast Fourier Transform (FFT) of a real-valued signal.
 * Uses the Cooley-Tukey algorithm.
 * @param signal The input array of numbers. Must have a length that is a power of 2.
 * @returns An array of magnitudes for the positive frequency components.
 */
export const calculateFFT = (signal: number[]): number[] => {
  const N = signal.length;
  if (N === 0 || (N & (N - 1)) !== 0) {
    // This basic implementation requires a power-of-2 length.
    // The calling function should handle padding.
    return [];
  }

  // Bit-reversal permutation
  const output: { re: number, im: number }[] = [];
  for (let i = 0; i < N; i++) {
    output.push({ re: signal[i], im: 0 });
  }

  const reverse = (i: number, bits: number): number => {
    let reversed = 0;
    for (let j = 0; j < bits; j++) {
      if ((i >> j) & 1) {
        reversed |= 1 << (bits - 1 - j);
      }
    }
    return reversed;
  };
  
  const bits = Math.log2(N);
  for (let i = 0; i < N; i++) {
    const rev = reverse(i, bits);
    if (i < rev) {
      [output[i], output[rev]] = [output[rev], output[i]];
    }
  }

  // Cooley-Tukey FFT
  for (let len = 2; len <= N; len <<= 1) {
    const halfLen = len >> 1;
    const angle = -2 * Math.PI / len;
    const w_len_re = Math.cos(angle);
    const w_len_im = Math.sin(angle);
    for (let i = 0; i < N; i += len) {
      let w_re = 1;
      let w_im = 0;
      for (let j = 0; j < halfLen; j++) {
        const u = output[i + j];
        const v_re = output[i + j + halfLen].re * w_re - output[i + j + halfLen].im * w_im;
        const v_im = output[i + j + halfLen].re * w_im + output[i + j + halfLen].im * w_re;
        
        output[i + j] = { re: u.re + v_re, im: u.im + v_im };
        output[i + j + halfLen] = { re: u.re - v_re, im: u.im - v_im };
        
        const next_w_re = w_re * w_len_re - w_im * w_len_im;
        w_im = w_re * w_len_im + w_im * w_len_re;
        w_re = next_w_re;
      }
    }
  }
  
  // Calculate magnitudes for the first half (positive frequencies)
  const magnitudes = [];
  for (let i = 0; i < N / 2; i++) {
    magnitudes.push(Math.sqrt(output[i].re ** 2 + output[i].im ** 2));
  }
  
  return magnitudes;
};

/**
 * Pads a signal to the next power of 2 length.
 * @param signal The input array of numbers.
 * @returns A new array padded with zeros.
 */
export const padSignal = (signal: number[]): number[] => {
    const len = signal.length;
    if (len === 0) return [];
    const nextPowerOf2 = 2 ** Math.ceil(Math.log2(len));
    const padded = new Array(nextPowerOf2).fill(0);
    for(let i=0; i < len; i++) {
        padded[i] = signal[i];
    }
    return padded;
};
