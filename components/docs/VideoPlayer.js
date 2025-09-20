import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  IconButton,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  HStack,
  VStack,
  Text,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  Card,
  CardBody,
  Badge,
  Progress,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  useDisclosure,
  Collapse,
  List,
  ListItem,
  useToast
} from '@chakra-ui/react';
import {
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
  FaExpand,
  FaCompress,
  FaCog,
  FaClosedCaptioning,
  FaBookmark,
  FaRegBookmark,
  FaBackward,
  FaForward,
  FaChevronDown,
  FaChevronUp,
  FaExternalLinkAlt
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const MotionBox = motion(Box);

const VideoPlayer = ({
  src,
  title,
  description,
  transcript,
  subtitles,
  chapters = [],
  onProgress,
  onComplete,
  poster,
  autoPlay = false,
  controls = true,
  width = '100%',
  height = 'auto',
  aspectRatio = '16:9'
}) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const toast = useToast();

  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSubtitles, setShowSubtitles] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [watchProgress, setWatchProgress] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [qualityLevel, setQualityLevel] = useState('auto');

  // Modals
  const { isOpen: isPiPOpen, onOpen: onPiPOpen, onClose: onPiPClose } = useDisclosure();

  // Color mode values
  const controlsBg = useColorModeValue('rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)');
  const textColor = 'white';
  const accentColor = useColorModeValue('blue.400', 'blue.300');

  // Hide controls timeout
  const controlsTimeoutRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Load saved progress
    const savedProgress = localStorage.getItem(`video-progress-${src}`);
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      setWatchProgress(progress.percentage);
      if (progress.time > 10) { // Resume if more than 10 seconds watched
        video.currentTime = progress.time;
      }
    }

    // Load bookmark status
    const bookmarks = JSON.parse(localStorage.getItem('video-bookmarks') || '[]');
    setIsBookmarked(bookmarks.includes(src));

    // Auto-hide controls
    const hideControls = () => {
      if (isPlaying) {
        setControlsVisible(false);
      }
    };

    const showControls = () => {
      setControlsVisible(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(hideControls, 3000);
    };

    const handleMouseMove = () => {
      showControls();
    };

    const handleMouseLeave = () => {
      if (isPlaying) {
        controlsTimeoutRef.current = setTimeout(hideControls, 1000);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, src]);

  // Video event handlers
  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) {
      setDuration(video.duration);
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      setCurrentTime(video.currentTime);

      // Update progress
      const progressPercentage = (video.currentTime / video.duration) * 100;
      setWatchProgress(progressPercentage);

      // Save progress to localStorage
      const progressData = {
        time: video.currentTime,
        percentage: progressPercentage,
        lastWatched: new Date().toISOString()
      };
      localStorage.setItem(`video-progress-${src}`, JSON.stringify(progressData));

      // Call onProgress callback
      onProgress?.(progressPercentage);

      // Update current chapter
      const chapter = chapters.find(ch =>
        video.currentTime >= ch.startTime &&
        video.currentTime < (ch.endTime || video.duration)
      );
      setCurrentChapter(chapter);

      // Check if completed (watched 90% or more)
      if (progressPercentage >= 90) {
        onComplete?.();
        trackEvent('video_complete');
      }
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
    trackEvent('video_play', { currentTime });
  };

  const handlePause = () => {
    setIsPlaying(false);
    trackEvent('video_pause', { currentTime });
  };

  const handleWaiting = () => setIsBuffering(true);
  const handleCanPlay = () => setIsBuffering(false);

  // Control handlers
  const togglePlay = () => {
    const video = videoRef.current;
    if (video) {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    }
  };

  const handleSeek = (value) => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = value;
      setCurrentTime(value);
    }
  };

  const handleVolumeChange = (value) => {
    const video = videoRef.current;
    if (video) {
      video.volume = value;
      setVolume(value);
      setIsMuted(value === 0);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
      if (isMuted) {
        video.volume = volume;
        setIsMuted(false);
      } else {
        video.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      } else if (container.mozRequestFullScreen) {
        container.mozRequestFullScreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      }
    }
  };

  const changePlaybackRate = (rate) => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = rate;
      setPlaybackRate(rate);
      trackEvent('playback_rate_change', { rate });
    }
  };

  const seekBySeconds = (seconds) => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
    }
  };

  const toggleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('video-bookmarks') || '[]');

    if (isBookmarked) {
      const newBookmarks = bookmarks.filter(bookmark => bookmark !== src);
      localStorage.setItem('video-bookmarks', JSON.stringify(newBookmarks));
      setIsBookmarked(false);
      toast({
        title: 'Marcador removido',
        status: 'info',
        duration: 2000
      });
    } else {
      bookmarks.push(src);
      localStorage.setItem('video-bookmarks', JSON.stringify(bookmarks));
      setIsBookmarked(true);
      toast({
        title: 'Video guardado en marcadores',
        status: 'success',
        duration: 2000
      });
    }

    trackEvent(isBookmarked ? 'bookmark_remove' : 'bookmark_add');
  };

  const enterPictureInPicture = async () => {
    const video = videoRef.current;
    if (video && document.pictureInPictureEnabled) {
      try {
        await video.requestPictureInPicture();
        trackEvent('pip_enter');
      } catch (error) {
        console.error('Error entering PiP:', error);
        toast({
          title: 'Error al activar Picture-in-Picture',
          description: 'Tu navegador no soporta esta función',
          status: 'error',
          duration: 3000
        });
      }
    }
  };

  const jumpToChapter = (chapter) => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = chapter.startTime;
      trackEvent('chapter_jump', { chapterTitle: chapter.title });
    }
  };

  // Analytics tracking
  const trackEvent = async (eventType, metadata = {}) => {
    try {
      await fetch('/api/docs/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: `video_${eventType}`,
          metadata: {
            videoSrc: src,
            videoTitle: title,
            currentTime,
            duration,
            watchProgress,
            ...metadata
          }
        })
      });
    } catch (error) {
      console.error('Failed to track video event:', error);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT') return; // Don't interfere with inputs

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'arrowleft':
          e.preventDefault();
          seekBySeconds(-10);
          break;
        case 'arrowright':
          e.preventDefault();
          seekBySeconds(10);
          break;
        case 'arrowup':
          e.preventDefault();
          handleVolumeChange(Math.min(1, volume + 0.1));
          break;
        case 'arrowdown':
          e.preventDefault();
          handleVolumeChange(Math.max(0, volume - 0.1));
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'c':
          e.preventDefault();
          setShowSubtitles(!showSubtitles);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [volume, showSubtitles]);

  // Fullscreen change detection
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Format time helper
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card width={width} overflow="hidden">
      <Box position="relative" ref={containerRef}>
        {/* Video element */}
        <Box
          position="relative"
          w="100%"
          h={height}
          paddingBottom={height === 'auto' ? '56.25%' : 0} // 16:9 aspect ratio
          overflow="hidden"
          bg="black"
        >
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            width="100%"
            height={height === 'auto' ? '100%' : height}
            style={{
              position: height === 'auto' ? 'absolute' : 'relative',
              top: 0,
              left: 0,
              objectFit: 'contain'
            }}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onPlay={handlePlay}
            onPause={handlePause}
            onWaiting={handleWaiting}
            onCanPlay={handleCanPlay}
            autoPlay={autoPlay}
            playsInline
          >
            {/* Subtitles track */}
            {subtitles && (
              <track
                kind="subtitles"
                src={subtitles}
                srcLang="es"
                label="Español"
                default={showSubtitles}
              />
            )}
          </video>

          {/* Loading spinner */}
          {isBuffering && (
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              color="white"
              fontSize="24px"
            >
              Loading...
            </Box>
          )}

          {/* Progress bar at top */}
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            h="4px"
            bg="rgba(255,255,255,0.3)"
          >
            <Box
              h="100%"
              bg={accentColor}
              width={`${watchProgress}%`}
              transition="width 0.1s"
            />
          </Box>

          {/* Custom controls overlay */}
          <AnimatePresence>
            {(controlsVisible || !isPlaying) && controls && (
              <MotionBox
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                position="absolute"
                bottom={0}
                left={0}
                right={0}
                bg={controlsBg}
                color={textColor}
                p={4}
              >
                <VStack spacing={3}>
                  {/* Progress slider */}
                  <HStack w="100%" spacing={3}>
                    <Text fontSize="sm" minW="50px">
                      {formatTime(currentTime)}
                    </Text>
                    <Slider
                      value={currentTime}
                      min={0}
                      max={duration || 100}
                      onChange={handleSeek}
                      focusThumbOnChange={false}
                      flex={1}
                    >
                      <SliderTrack bg="rgba(255,255,255,0.3)">
                        <SliderFilledTrack bg={accentColor} />
                      </SliderTrack>
                      <SliderThumb bg={accentColor} />
                    </Slider>
                    <Text fontSize="sm" minW="50px">
                      {formatTime(duration)}
                    </Text>
                  </HStack>

                  {/* Control buttons */}
                  <HStack justify="space-between" w="100%">
                    <HStack>
                      {/* Play/Pause */}
                      <IconButton
                        icon={isPlaying ? <FaPause /> : <FaPlay />}
                        onClick={togglePlay}
                        variant="ghost"
                        color={textColor}
                        size="lg"
                        _hover={{ bg: 'rgba(255,255,255,0.2)' }}
                      />

                      {/* Skip buttons */}
                      <IconButton
                        icon={<FaBackward />}
                        onClick={() => seekBySeconds(-10)}
                        variant="ghost"
                        color={textColor}
                        size="sm"
                        _hover={{ bg: 'rgba(255,255,255,0.2)' }}
                      />
                      <IconButton
                        icon={<FaForward />}
                        onClick={() => seekBySeconds(10)}
                        variant="ghost"
                        color={textColor}
                        size="sm"
                        _hover={{ bg: 'rgba(255,255,255,0.2)' }}
                      />

                      {/* Volume */}
                      <HStack>
                        <IconButton
                          icon={isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                          onClick={toggleMute}
                          variant="ghost"
                          color={textColor}
                          size="sm"
                          _hover={{ bg: 'rgba(255,255,255,0.2)' }}
                        />
                        <Slider
                          value={isMuted ? 0 : volume}
                          min={0}
                          max={1}
                          step={0.1}
                          onChange={handleVolumeChange}
                          w="80px"
                        >
                          <SliderTrack bg="rgba(255,255,255,0.3)">
                            <SliderFilledTrack bg={accentColor} />
                          </SliderTrack>
                          <SliderThumb bg={accentColor} />
                        </Slider>
                      </HStack>

                      {/* Current chapter */}
                      {currentChapter && (
                        <Badge colorScheme="blue" fontSize="xs">
                          {currentChapter.title}
                        </Badge>
                      )}
                    </HStack>

                    <HStack>
                      {/* Bookmark */}
                      <Tooltip label={isBookmarked ? 'Quitar marcador' : 'Agregar marcador'}>
                        <IconButton
                          icon={isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
                          onClick={toggleBookmark}
                          variant="ghost"
                          color={textColor}
                          size="sm"
                          _hover={{ bg: 'rgba(255,255,255,0.2)' }}
                        />
                      </Tooltip>

                      {/* Subtitles */}
                      {subtitles && (
                        <Tooltip label="Subtítulos">
                          <IconButton
                            icon={<FaClosedCaptioning />}
                            onClick={() => setShowSubtitles(!showSubtitles)}
                            variant="ghost"
                            color={showSubtitles ? accentColor : textColor}
                            size="sm"
                            _hover={{ bg: 'rgba(255,255,255,0.2)' }}
                          />
                        </Tooltip>
                      )}

                      {/* Settings menu */}
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<FaCog />}
                          variant="ghost"
                          color={textColor}
                          size="sm"
                          _hover={{ bg: 'rgba(255,255,255,0.2)' }}
                        />
                        <MenuList color="black">
                          <Text px={3} py={2} fontSize="sm" fontWeight="bold">
                            Velocidad de reproducción
                          </Text>
                          {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                            <MenuItem
                              key={rate}
                              onClick={() => changePlaybackRate(rate)}
                              bg={playbackRate === rate ? 'blue.50' : 'transparent'}
                            >
                              {rate}x {rate === 1 && '(Normal)'}
                            </MenuItem>
                          ))}
                        </MenuList>
                      </Menu>

                      {/* Picture-in-Picture */}
                      {document.pictureInPictureEnabled && (
                        <Tooltip label="Picture-in-Picture">
                          <IconButton
                            icon={<FaExternalLinkAlt />}
                            onClick={enterPictureInPicture}
                            variant="ghost"
                            color={textColor}
                            size="sm"
                            _hover={{ bg: 'rgba(255,255,255,0.2)' }}
                          />
                        </Tooltip>
                      )}

                      {/* Fullscreen */}
                      <IconButton
                        icon={isFullscreen ? <FaCompress /> : <FaExpand />}
                        onClick={toggleFullscreen}
                        variant="ghost"
                        color={textColor}
                        size="sm"
                        _hover={{ bg: 'rgba(255,255,255,0.2)' }}
                      />
                    </HStack>
                  </HStack>
                </VStack>
              </MotionBox>
            )}
          </AnimatePresence>
        </Box>

        {/* Video info */}
        <CardBody>
          <VStack align="stretch" spacing={4}>
            {/* Title and description */}
            <Box>
              <HStack justify="space-between" align="start" mb={2}>
                <VStack align="start" spacing={1}>
                  <Text fontWeight="bold" fontSize="lg">{title}</Text>
                  {description && (
                    <Text fontSize="sm" color="gray.600">{description}</Text>
                  )}
                </VStack>
                <Badge colorScheme="green">{Math.round(watchProgress)}% visto</Badge>
              </HStack>

              <Progress value={watchProgress} size="sm" colorScheme="blue" />
            </Box>

            {/* Chapters list */}
            {chapters.length > 0 && (
              <Box>
                <Button
                  leftIcon={showTranscript ? <FaChevronUp /> : <FaChevronDown />}
                  onClick={() => setShowTranscript(!showTranscript)}
                  variant="ghost"
                  size="sm"
                  mb={2}
                >
                  Capítulos ({chapters.length})
                </Button>
                <Collapse in={showTranscript}>
                  <List spacing={2}>
                    {chapters.map((chapter, index) => (
                      <ListItem
                        key={index}
                        p={2}
                        borderRadius="md"
                        bg={currentChapter?.title === chapter.title ? 'blue.50' : 'gray.50'}
                        cursor="pointer"
                        _hover={{ bg: 'blue.100' }}
                        onClick={() => jumpToChapter(chapter)}
                      >
                        <HStack justify="space-between">
                          <Text fontWeight="bold">{chapter.title}</Text>
                          <Text fontSize="sm" color="gray.600">
                            {formatTime(chapter.startTime)}
                          </Text>
                        </HStack>
                        {chapter.description && (
                          <Text fontSize="sm" color="gray.600" mt={1}>
                            {chapter.description}
                          </Text>
                        )}
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </Box>
            )}

            {/* Transcript */}
            {transcript && (
              <Box>
                <Button
                  leftIcon={showTranscript ? <FaChevronUp /> : <FaChevronDown />}
                  onClick={() => setShowTranscript(!showTranscript)}
                  variant="ghost"
                  size="sm"
                  mb={2}
                >
                  Transcripción
                </Button>
                <Collapse in={showTranscript}>
                  <Box
                    p={4}
                    bg="gray.50"
                    borderRadius="md"
                    maxH="200px"
                    overflowY="auto"
                    fontSize="sm"
                    lineHeight="tall"
                  >
                    {transcript}
                  </Box>
                </Collapse>
              </Box>
            )}
          </VStack>
        </CardBody>
      </Box>
    </Card>
  );
};

export default VideoPlayer;