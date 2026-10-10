'use client';
import React from 'react';
import { ClipLoader } from 'react-spinners';

/**
 * Loader loading state. Berbasis react-spinners ClipLoader.
 *
 * @param {{ size?: number|string, color?: string, inline?: boolean, className?: string }} props
 */
const Loader = ({ size = 50, color = 'var(--brand)', inline = false, className = '' }) => {
  const wrapper = inline
    ? 'inline-flex items-center justify-center'
    : 'flex w-full items-center justify-center';
  return (
    <div className={`${wrapper} ${className}`}>
      <ClipLoader color={color} size={size} />
    </div>
  );
};

export default Loader;
