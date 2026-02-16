import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const Home = () => {
  const canvasRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    // Handle responsive state
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = isMobile ? 20 : isTablet ? 35 : 50;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.5 + 0.3;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Draw connections between nearby particles
    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 * (1 - distance / 150)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      drawConnections();
      requestAnimationFrame(animate);
    };

    animate();

    // Handle window resize
    const handleCanvasResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleCanvasResize);
    return () => window.removeEventListener('resize', handleCanvasResize);
  }, [isMobile, isTablet]);

  const features = [
    {
      title: 'Easy CV Builder',
      description: 'Intuitive editor to create and update your CV with multiple sections and live preview.',
      bgColor: '#e3f2fd',
      hoverColor: '#bbdefb'
    },
    {
      title: 'Digital Security',
      description: 'Sign your CV with electronic or digital signatures. Add watermarks, QR codes, and barcodes for verification.',
      bgColor: '#f3e5f5',
      hoverColor: '#e1bee7'
    },
    {
      title: 'Version Control',
      description: 'Track changes and revisions. Download secure PDF versions for sharing and printing.',
      bgColor: '#e8f5e9',
      hoverColor: '#c8e6c9'
    },
    {
      title: 'Admin Management',
      description: 'Admins can manage users, activate/deactivate accounts, and ensure system integrity.',
      bgColor: '#fff3e0',
      hoverColor: '#ffe0b2'
    },
    {
      title: 'Cloud Storage',
      description: 'Securely store and access your CVs from anywhere. Automatic backups and version history.',
      bgColor: '#fce4ec',
      hoverColor: '#f8bbd0'
    },
    {
      title: 'Analytics & Reports',
      description: 'Track CV downloads, views, and sharing statistics. Get insights into your document engagement.',
      bgColor: '#ede7f6',
      hoverColor: '#ddd6f3'
    }
  ];

  const steps = [
    'Register and activate your account via email.',
    'Login with OTP for enhanced security.',
    'Build and customize your CV with profile, sections, and signatures.',
    'Generate secure PDFs with embedded QR/barcodes and watermarks.',
    'Download, share, and verify your documents.'
  ];

  const styles = {
    canvasContainer: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: -1
    },
    canvas: {
      display: 'block'
    },
    navbar: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      background: 'rgba(102, 126, 234, 0.95)',
      backdropFilter: 'blur(10px)',
      padding: isMobile ? '12px 15px' : '15px 30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      zIndex: 100,
      flexWrap: isMobile ? 'wrap' : 'nowrap'
    },
    navBrand: {
      fontSize: isMobile ? '1.2rem' : '1.5rem',
      fontWeight: 'bold',
      color: '#fff',
      textDecoration: 'none',
      cursor: 'pointer'
    },
    navLinks: {
      display: 'flex',
      gap: isMobile ? '10px' : '25px',
      alignItems: 'center',
      flexWrap: isMobile ? 'wrap' : 'nowrap'
    },
    navLink: {
      color: '#fff',
      textDecoration: 'none',
      fontSize: isMobile ? '0.8rem' : '0.95rem',
      transition: 'opacity 0.3s',
      cursor: 'pointer'
    },
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: isMobile ? '100px 15px 0 15px' : isTablet ? '110px 20px 0 20px' : '120px 20px 0 20px',
      fontFamily: 'Arial, sans-serif',
      position: 'relative',
      zIndex: 1,
      marginBottom: 0
    },
    header: {
      textAlign: 'center',
      color: '#fff',
      marginBottom: isMobile ? '40px' : isTablet ? '50px' : '60px'
    },
    title: {
      fontSize: isMobile ? '2rem' : isTablet ? '2.5rem' : '3.5rem',
      fontWeight: 'bold',
      marginBottom: '10px',
      textShadow: '0 2px 10px rgba(0,0,0,0.3)',
      lineHeight: 1.2
    },
    subtitle: {
      fontSize: isMobile ? '0.9rem' : isTablet ? '1.1rem' : '1.3rem',
      opacity: 0.95,
      marginBottom: isMobile ? '25px' : isTablet ? '30px' : '40px',
      textShadow: '0 1px 5px rgba(0,0,0,0.2)'
    },
    ctaButtons: {
      display: 'flex',
      gap: isMobile ? '10px' : '15px',
      justifyContent: 'center',
      flexWrap: 'wrap'
    },
    button: {
      padding: isMobile ? '10px 20px' : '12px 30px',
      fontSize: isMobile ? '0.9rem' : '1rem',
      fontWeight: 'bold',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'transform 0.3s, box-shadow 0.3s'
    },
    primaryBtn: {
      background: '#fff',
      color: '#667eea',
      boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
    },
    secondaryBtn: {
      background: 'transparent',
      color: '#fff',
      border: '2px solid #fff',
      boxShadow: 'none'
    },
    buttonHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(0,0,0,0.3)'
    },
    featuresSection: {
      maxWidth: '1200px',
      margin: '0 auto',
      marginBottom: isMobile ? '50px' : isTablet ? '65px' : '80px',
      padding: isMobile ? '0 10px' : '0'
    },
    sectionTitle: {
      fontSize: isMobile ? '1.8rem' : isTablet ? '2.2rem' : '2.5rem',
      fontWeight: 'bold',
      color: '#fff',
      textAlign: 'center',
      marginBottom: isMobile ? '25px' : isTablet ? '30px' : '40px',
      textShadow: '0 2px 10px rgba(0,0,0,0.2)'
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
      gap: isMobile ? '15px' : isTablet ? '20px' : '25px'
    },
    featureBox: {
      padding: isMobile ? '20px 15px' : isTablet ? '25px' : '30px',
      borderRadius: '12px',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    },
    featureTitle: {
      fontSize: isMobile ? '1.1rem' : isTablet ? '1.2rem' : '1.4rem',
      fontWeight: 'bold',
      marginBottom: '12px',
      color: '#333'
    },
    featureDesc: {
      fontSize: isMobile ? '0.85rem' : isTablet ? '0.9rem' : '0.95rem',
      color: '#555',
      lineHeight: '1.6'
    },
    howWorksSection: {
      maxWidth: '1200px',
      margin: '0 auto',
      background: 'rgba(255,255,255,0.95)',
      padding: isMobile ? '30px 20px' : isTablet ? '40px 30px' : '50px 40px',
      borderRadius: '15px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
      backdropFilter: 'blur(10px)',
      marginBottom: '0'
    },
    howWorksTitle: {
      fontSize: isMobile ? '1.6rem' : isTablet ? '2rem' : '2.2rem',
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: isMobile ? '30px' : isTablet ? '35px' : '40px',
      color: '#667eea'
    },
    howWorksContent: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: isMobile ? '25px' : isTablet ? '30px' : '40px',
      alignItems: 'center'
    },
    stepsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: isMobile ? '8px' : isTablet ? '10px' : '12px'
    },
    stepItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: isMobile ? '12px' : isTablet ? '15px' : '20px'
    },
    stepNumber: {
      minWidth: isMobile ? '32px' : '40px',
      height: isMobile ? '32px' : '40px',
      background: '#667eea',
      color: '#fff',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontSize: isMobile ? '0.9rem' : '1.1rem',
      flexShrink: 0
    },
    stepText: {
      fontSize: isMobile ? '0.85rem' : isTablet ? '0.9rem' : '1rem',
      color: '#333',
      lineHeight: '1.6',
      paddingTop: '5px'
    },
    cvTemplate: {
      background: '#fff',
      padding: isMobile ? '15px' : isTablet ? '18px' : '20px',
      borderRadius: '10px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: isMobile ? '250px' : isTablet ? '300px' : '360px'
    },
    cvImage: {
      width: '100%',
      maxWidth: isMobile ? '280px' : isTablet ? '350px' : '420px',
      height: 'auto',
      objectFit: 'contain',
      borderRadius: '8px',
      display: 'block'
    },
    footer: {
      background: 'rgba(0,0,0,0.3)',
      color: '#fff',
      textAlign: 'center',
      padding: isMobile ? '20px 15px' : isTablet ? '25px 20px' : '30px 20px',
      marginTop: isMobile ? '40px' : isTablet ? '50px' : '60px',
      marginLeft: isMobile ? '-15px' : isTablet ? '-20px' : '-20px',
      marginRight: isMobile ? '-15px' : isTablet ? '-20px' : '-20px',
      marginBottom: '0',
      borderTop: '1px solid rgba(255,255,255,0.2)',
      fontSize: isMobile ? '0.8rem' : isTablet ? '0.9rem' : '0.95rem',
      width: isMobile ? 'calc(100% + 30px)' : isTablet ? 'calc(100% + 40px)' : 'calc(100% + 40px)'
    },
    footerText: {
      margin: '10px 0',
      opacity: 0.9
    },
    footerLinks: {
      display: 'flex',
      gap: isMobile ? '15px' : isTablet ? '20px' : '30px',
      justifyContent: 'center',
      marginTop: '15px',
      flexWrap: 'wrap'
    },
    footerLink: {
      color: '#fff',
      textDecoration: 'none',
      transition: 'opacity 0.3s',
      cursor: 'pointer',
      fontSize: isMobile ? '0.75rem' : 'inherit'
    }
  };

  return (
    <>
      {/* Interactive Background */}
      <div style={styles.canvasContainer}>
        <canvas ref={canvasRef} style={styles.canvas}></canvas>
      </div>

      {/* Fixed Top Menu */}
      <nav style={styles.navbar}>
        <Link href="/">
          <span style={styles.navBrand}>CV Builder</span>
        </Link>
        <div style={styles.navLinks}>
          <a 
            href="#features" 
            style={styles.navLink}
            onMouseEnter={(e) => e.target.style.opacity = '0.7'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            Features
          </a>
          <a 
            href="#how-it-works" 
            style={styles.navLink}
            onMouseEnter={(e) => e.target.style.opacity = '0.7'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            How It Works
          </a>
          <Link href="/login-otp">
            <button 
              style={{...styles.button, ...styles.secondaryBtn}}
              onMouseEnter={(e) => Object.assign(e.target.style, styles.buttonHover)}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              Login
            </button>
          </Link>
        </div>
      </nav>

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>CV/Resume Builder</h1>
          <p style={styles.subtitle}>Build, Sign, and Manage Your Professional Documents</p>
          <div style={styles.ctaButtons}>
            <Link href="/register">
              <button 
                style={{...styles.button, ...styles.primaryBtn}}
                onMouseEnter={(e) => Object.assign(e.target.style, styles.buttonHover)}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                Get Started
              </button>
            </Link>
            <Link href="/login-otp">
              <button 
                style={{...styles.button, ...styles.secondaryBtn}}
                onMouseEnter={(e) => Object.assign(e.target.style, styles.buttonHover)}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                Login
              </button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div style={styles.featuresSection} id="features">
          <h2 style={styles.sectionTitle}>Key Features</h2>
          <div style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div
                key={index}
                style={{
                  ...styles.featureBox,
                  backgroundColor: feature.bgColor
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = feature.hoverColor;
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = feature.bgColor;
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
              >
                <h3 style={styles.featureTitle}>{feature.title}</h3>
                <p style={styles.featureDesc}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works Section */}
        <div style={styles.howWorksSection} id="how-it-works">
          <h2 style={styles.howWorksTitle}>How It Works</h2>
          <div style={styles.howWorksContent}>
            <div>
              <div style={styles.stepsList}>
                {steps.map((step, index) => (
                  <div key={index} style={styles.stepItem}>
                    <div style={styles.stepNumber}>{index + 1}</div>
                    <p style={styles.stepText}>{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.cvTemplate}>
              <img
                src="/cv-template.webp"
                alt="CV template preview"
                style={styles.cvImage}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer style={styles.footer}>
          <p style={styles.footerText}>
            © 2026 CV/Resume Builder and Management System. All rights reserved.
          </p>
          <div style={styles.footerLinks}>
            <a 
              href="#" 
              style={styles.footerLink}
              onMouseEnter={(e) => e.target.style.opacity = '0.7'}
              onMouseLeave={(e) => e.target.style.opacity = '0.9'}
            >
              Privacy Policy
            </a>
            <a 
              href="#" 
              style={styles.footerLink}
              onMouseEnter={(e) => e.target.style.opacity = '0.7'}
              onMouseLeave={(e) => e.target.style.opacity = '0.9'}
            >
              Terms of Service
            </a>
            <a 
              href="#" 
              style={styles.footerLink}
              onMouseEnter={(e) => e.target.style.opacity = '0.7'}
              onMouseLeave={(e) => e.target.style.opacity = '0.9'}
            >
              Contact Us
            </a>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Home;
