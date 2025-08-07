import { useState, useEffect } from "react";
import { Box, Heading, Text, Flex } from "@chakra-ui/react";
import { extendTheme } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";

// Animaciones con keyframes para toda la aplicación
export const blinkAnimation = keyframes`
    0% { 
        background: rgba(255, 255, 255, 0.9);
        transform: scale(1);
    }
    50% { 
        background: rgba(255, 255, 255, 0.95);
        transform: scale(1.02);
    }
    100% { 
        background: rgba(255, 255, 255, 0.9);
        transform: scale(1);
    }
`;

export const fadeInUp = keyframes`
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
`;

export const pulseGlow = keyframes`
    0%, 100% {
        box-shadow: 0 0 20px rgba(79, 125, 243, 0.3);
    }
    50% {
        box-shadow: 0 0 40px rgba(79, 125, 243, 0.6);
    }
`;

export const slideInFromRight = keyframes`
    from {
        opacity: 0;
        transform: translateX(50px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
`;

export const slideInFromLeft = keyframes`
    from {
        opacity: 0;
        transform: translateX(-50px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
`;

// Tema personalizado inspirado en el diseño moderno
export const modernTheme = extendTheme({
    colors: {
        primary: {
            50: "#f0f9ff",
            100: "#e0f2fe",
            200: "#bae6fd",
            300: "#7dd3fc",
            400: "#38bdf8",
            500: "#4F7DF3", // Azul moderno del diseño
            600: "#0284c7",
            700: "#0369a1",
            800: "#075985",
            900: "#0c4a6e",
        },
        secondary: {
            50: "#f8fafc",
            100: "#f1f5f9",
            200: "#e2e8f0",
            300: "#cbd5e1",
            400: "#94a3b8",
            500: "#64748b",
            600: "#475569",
            700: "#334155",
            800: "#1e293b",
            900: "#0f172a",
        },
        purple: {
            500: "#6B73FF", // Púrpura moderno
            600: "#764ba2",
        },
        success: "#10b981",
        warning: "#f59e0b",
        error: "#ef4444",
        info: "#3b82f6",
    },
    fonts: {
        heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
    shadows: {
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
    },
    radii: {
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "32px",
    },
    styles: {
        global: {
            body: {
                // Gradiente de fondo moderno
                background: 'linear-gradient(135deg, #E0F2FE 0%, #F0F9FF 50%, #EDE9FE 100%)',
                color: 'secondary.700',
                fontFamily: "'Inter', sans-serif",
                minHeight: '100vh',
                fontFeatureSettings: '"cv11", "ss01"',
                fontVariationSettings: '"opsz" 32',
            },
        },
    },
    components: {
        Button: {
            baseStyle: {
                fontWeight: 'semibold',
                borderRadius: 'lg',
                transition: 'all 0.3s ease',
            },
            variants: {
                gradient: {
                    background: 'linear-gradient(135deg, #4F7DF3 0%, #6B73FF 100%)',
                    color: 'white',
                    _hover: {
                        transform: 'translateY(-2px)',
                        boxShadow: 'xl',
                    },
                },
                success: {
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    _hover: {
                        transform: 'translateY(-2px)',
                        boxShadow: 'xl',
                    },
                },
                warning: {
                    background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
                    color: 'white',
                    _hover: {
                        transform: 'translateY(-2px)',
                        boxShadow: 'xl',
                    },
                },
                danger: {
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white',
                    _hover: {
                        transform: 'translateY(-2px)',
                        boxShadow: 'xl',
                    },
                },
            },
        },
        Input: {
            variants: {
                modern: {
                    field: {
                        background: 'rgba(255, 255, 255, 0.7)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: 'lg',
                        _focus: {
                            borderColor: 'primary.500',
                            boxShadow: '0 0 0 1px rgba(79, 125, 243, 0.3)',
                        },
                    },
                },
            },
        },
        Select: {
            variants: {
                modern: {
                    field: {
                        background: 'rgba(255, 255, 255, 0.7)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: 'lg',
                        _focus: {
                            borderColor: 'primary.500',
                            boxShadow: '0 0 0 1px rgba(79, 125, 243, 0.3)',
                        },
                    },
                },
            },
        },
    },
});

// Componentes comunes de UI
export const GlassCard = ({ children, ...props }) => (
    <Box
        background="rgba(255, 255, 255, 0.25)"
        backdropFilter="blur(20px)"
        boxShadow="glass"
        border="1px solid rgba(255, 255, 255, 0.18)"
        borderRadius="2xl"
        {...props}
    >
        {children}
    </Box>
);

export const ModernContainer = ({ children, ...props }) => (
    <Box
        minHeight="100vh"
        p={{ base: 4, md: 6 }}
        display="flex"
        flexDirection="column"
        {...props}
    >
        {children}
    </Box>
);

export const ModernHeader = ({ title, subtitle, time = true, ...props }) => {
    const [currentTime, setCurrentTime] = useState(null);

    useEffect(() => {
        setCurrentTime(new Date());
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (date) => {
        if (!date) return "Cargando...";
        return date.toLocaleString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <GlassCard
            p={6}
            mb={6}
            animation={`${fadeInUp} 0.8s ease-out`}
            {...props}
        >
            <Flex justify="space-between" align="center">
                <Box flex="1" textAlign="center">
                    <Heading 
                        fontSize={{ base: "3xl", md: "4xl" }}
                        fontWeight="extrabold"
                        background="linear-gradient(135deg, #4F7DF3 0%, #6B73FF 100%)"
                        backgroundClip="text"
                        color="transparent"
                        letterSpacing="-0.02em"
                        lineHeight="1"
                    >
                        {title}
                    </Heading>
                    {subtitle && (
                        <Text
                            fontSize={{ base: "md", md: "lg" }}
                            color="secondary.600"
                            fontWeight="medium"
                            mt={1}
                        >
                            {subtitle}
                        </Text>
                    )}
                </Box>
                {time && (
                    <Box
                        p={3}
                        background="rgba(255, 255, 255, 0.4)"
                        borderRadius="lg"
                        border="1px solid rgba(255, 255, 255, 0.3)"
                        display={{ base: "none", md: "block" }}
                    >
                        <Text
                            fontSize="sm"
                            color="secondary.800"
                            fontWeight="bold"
                            textAlign="center"
                        >
                            {formatTime(currentTime)}
                        </Text>
                    </Box>
                )}
            </Flex>
        </GlassCard>
    );
};

// Export por defecto del tema
export default modernTheme;