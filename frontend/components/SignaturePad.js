import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';

export default function SignaturePad({ onSave }) {
  const { t } = useTranslation();
  const canvasRef = useRef(null);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    canvas.isDrawing = true;
  };

  const draw = (e) => {
    if (!canvasRef.current.isDrawing) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    canvasRef.current.isDrawing = false;
  };

  const handleSave = () => {
    const dataUrl = canvasRef.current.toDataURL('image/png');
    onSave(dataUrl);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={300}
        height={100}
        style={{ border: '1px solid #ccc' }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
      <div>
        <button onClick={handleSave}>{t('signaturePad.save')}</button>
        <button onClick={handleClear}>{t('signaturePad.clear')}</button>
      </div>
    </div>
  );
}
