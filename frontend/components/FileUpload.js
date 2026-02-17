import React, { useState, useRef } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function FileUpload({ label, endpoint, field, onUploadSuccess })  {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [scale, setScale] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [croppedArea, setCroppedArea] = useState({ x: 0, y: 0, width: 300, height: 300 });
  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  const handleChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMessage('');
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target.result);
        setShowCropModal(true);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const drawImage = React.useCallback(() => {
    if (!imgRef.current || !canvasRef.current || !imgRef.current.complete) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imgRef.current;

    // Set canvas size
    canvas.width = 400;
    canvas.height = 400;

    // Clear canvas
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save context
    ctx.save();

    // Move to center, rotate, and scale
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale / 100, scale / 100);

    // Draw image centered
    ctx.drawImage(img, -img.width / 2, -img.height / 2);

    // Restore context
    ctx.restore();

    // Draw crop area guides
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    const cropSize = 300;
    const offset = (canvas.width - cropSize) / 2;
    ctx.strokeRect(offset, offset, cropSize, cropSize);
  }, [scale, rotation]);

  React.useEffect(() => {
    if (preview && imgRef.current) {
      if (imgRef.current.complete) {
        drawImage();
      } else {
        imgRef.current.onload = drawImage;
      }
    }
  }, [preview, drawImage]);

  React.useEffect(() => {
    drawImage();
  }, [scale, rotation, drawImage]);

  const handleCropConfirm = async () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    
    // Create a new canvas for the cropped image
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = 300;
    cropCanvas.height = 300;
    const cropCtx = cropCanvas.getContext('2d');

    // Draw the cropped area from the main canvas
    const offset = (canvas.width - 300) / 2;
    cropCtx.drawImage(canvas, offset, offset, 300, 300, 0, 0, 300, 300);

    // Convert to blob and upload
    cropCanvas.toBlob(async (blob) => {
      try {
        const formData = new FormData();
        formData.append(field, blob, `${field}.png`);

        const token = localStorage.getItem('token');
        await axios.post(`${API_URL}/api/upload/${endpoint}`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });

        setMessage('✓ Image uploaded successfully!');
        setShowCropModal(false);
        setFile(null);
        setPreview(null);
        setScale(100);
        setRotation(0);
        if (onUploadSuccess) {
          onUploadSuccess();
        }
        setTimeout(() => setMessage(''), 3000);
      } catch (err) {
        setMessage('❌ Upload failed');
      }
    }, 'image/png');
  };

  return (
    <div style={{ margin: '20px 0' }}>
      <label style={{
        display: 'block',
        marginBottom: '12px',
        fontWeight: '600',
        color: '#333'
      }}>
        {label}
      </label>

      <div style={{
        position: 'relative',
        marginBottom: '12px'
      }}>
        <input
          type="file"
          accept="image/*"
          onChange={handleChange}
          style={{
            display: 'block',
            width: '100%',
            padding: '10px',
            border: '2px solid #ddd',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        />
      </div>

      {message && (
        <div style={{
          padding: '10px 12px',
          backgroundColor: message.includes('✓') ? '#d4edda' : '#f8d7da',
          color: message.includes('✓') ? '#155724' : '#721c24',
          borderRadius: '4px',
          marginTop: '10px',
          fontSize: '14px',
          border: `1px solid ${message.includes('✓') ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message}
        </div>
      )}

      {/* Crop Modal */}
      {showCropModal && preview && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '10px',
            padding: '30px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{
              margin: '0 0 20px 0',
              fontSize: '20px',
              fontWeight: '700',
              color: '#333'
            }}>
              ✂️ Crop & Resize Image
            </h3>

            {/* Preview Canvas */}
            <div style={{
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <canvas
                ref={canvasRef}
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
              <img
                ref={imgRef}
                src={preview}
                style={{ display: 'none' }}
                alt="preview"
              />
            </div>

            {/* Controls */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#333',
                  fontSize: '14px'
                }}>
                  📏 Scale: {scale}%
                </label>
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  style={{
                    width: '100%',
                    height: '6px',
                    borderRadius: '3px',
                    background: '#667eea',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#333',
                  fontSize: '14px'
                }}>
                  🔄 Rotation: {rotation}°
                </label>
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  marginBottom: '10px'
                }}>
                  <button
                    onClick={() => setRotation((rotation - 90 + 360) % 360)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    ↺ Left
                  </button>
                  <button
                    onClick={() => setRotation((rotation + 90) % 360)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    Right ↻
                  </button>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  style={{
                    width: '100%',
                    height: '6px',
                    borderRadius: '3px',
                    background: '#667eea',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => {
                  setShowCropModal(false);
                  setPreview(null);
                  setFile(null);
                  setScale(100);
                  setRotation(0);
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#e8e8e8',
                  color: '#333',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                ✕ Cancel
              </button>
              <button
                onClick={handleCropConfirm}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                ✓ Crop & Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
