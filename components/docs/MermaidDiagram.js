import { useEffect, useRef } from 'react';
import { Box } from '@chakra-ui/react';

const MermaidDiagram = ({ chart }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!chart || !containerRef.current) return;

      try {
        // Dynamic import of mermaid to avoid SSR issues
        const mermaid = (await import('mermaid')).default;

        mermaid.initialize({
          startOnLoad: true,
          theme: 'default',
          themeVariables: {
            primaryColor: '#4F7DF3',
            primaryTextColor: '#fff',
            primaryBorderColor: '#6B73FF',
            lineColor: '#5a5a5a',
            secondaryColor: '#6B73FF',
            tertiaryColor: '#fff',
            background: '#f4f4f4',
            mainBkg: '#4F7DF3',
            secondBkg: '#6B73FF',
            tertiaryBkg: '#fff'
          }
        });

        // Clear previous content
        containerRef.current.innerHTML = '';

        // Create a unique ID for this diagram
        const id = `mermaid-${Date.now()}`;

        // Create the element
        const element = document.createElement('div');
        element.id = id;
        element.innerHTML = chart;
        containerRef.current.appendChild(element);

        // Render the diagram
        await mermaid.run({
          querySelector: `#${id}`
        });
      } catch (error) {
        console.error('Error rendering Mermaid diagram:', error);
        // Fallback: show the raw chart text
        if (containerRef.current) {
          containerRef.current.innerHTML = `<pre>${chart}</pre>`;
        }
      }
    };

    renderDiagram();
  }, [chart]);

  return (
    <Box
      ref={containerRef}
      p={4}
      bg="white"
      borderRadius="lg"
      boxShadow="md"
      overflowX="auto"
      sx={{
        '& svg': {
          maxWidth: '100%',
          height: 'auto'
        },
        '& pre': {
          padding: '1rem',
          backgroundColor: '#f5f5f5',
          borderRadius: '0.5rem',
          overflow: 'auto'
        }
      }}
    />
  );
};

export default MermaidDiagram;