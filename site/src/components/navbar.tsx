import { useEffect, useRef, useState } from "react"
import { Menu, Pause, Play, X, ChevronDown, Settings, ImageIcon, Home } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import  {NavItem}  from "./NavItem"

const navItems = [
  { name: "Home", href: "/", type: "route", icon: Home },
  { name: "Blog", href: "/blog", type: "route" },
  { name: "Projects", href: "/project", type: "route" },
  { name: "About", href: "/about", type: "route" },
  { name: "Contact", href: "contact", type: "scroll" },
] as const

const moreItems = [
  { name: "Gallery", href: "/gallery", type: "route", icon: ImageIcon },
  { name: "Uses", href: "/uses", type: "route", icon: Settings },
] as const

export default function MinimalNavbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [activeItem, setActiveItem] = useState("Home")

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const lastScrollY = useRef(0)

  useEffect(() => {
    audioRef.current = new Audio(
      "https://res.cloudinary.com/din8s15ri/video/upload/v1751588192/Marutsuke_Instrumental_mtppye.mp3",
    )
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Update scrolled state
      setIsScrolled(currentScrollY > 20)

      // Handle navbar visibility
      if (currentScrollY < 10) {
        // Always show at top
        setIsVisible(true)
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        // Scrolling down - hide navbar
        setIsVisible(false)
        setShowMore(false) // Close dropdown when hiding
      } else if (currentScrollY < lastScrollY.current) {
        // Scrolling up - show navbar
        setIsVisible(true)
      }

      lastScrollY.current = currentScrollY
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const handleEnded = () => setIsPlaying(false)
    audio.addEventListener("ended", handleEnded)
    return () => audio.removeEventListener("ended", handleEnded)
  }, [])

  useEffect(() => {
    const handleFirstClick = () => {
      const audio = audioRef.current
      if (!audio) return

      audio.preload = "auto"
      audio.volume = 0.5

      if (audio.paused) {
        audio
          .play()
          .then(() => {
            setIsPlaying(true)
          })
          .catch((error) => {
            console.warn("Autoplay blocked:", error)
          })
      }

      document.removeEventListener("click", handleFirstClick)
    }

    document.addEventListener("click", handleFirstClick, { once: true })

    return () => {
      document.removeEventListener("click", handleFirstClick)
    }
  }, [])

  // Set active item based on current path
  useEffect(() => {
    const path = window.location.pathname
    const currentItem = [...navItems, ...moreItems].find((item) => item.type === "route" && item.href === path)
    if (currentItem) {
      setActiveItem(currentItem.name)
    }
  }, [])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  return (
    <>
      {/* Logo */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{
          x: isVisible ? 0 : -100,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-6 left-6 z-50"
      >
          <img src="/icons/logo.svg" className="size-14" alt="" />

      </motion.div>

      {/* Minimal Floating Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4">
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{
            y: isVisible ? 0 : -100,
            opacity: isVisible ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="w-auto"
        >
          <div
            className={`
            bg-black/90 backdrop-blur-sm rounded-2xl border border-gray-800/50 shadow-xl
            transition-all duration-300
            ${isScrolled ? "bg-black/95" : "bg-black/90"}
          `}
          >
            {/* Desktop Layout */}
            <div className="hidden md:flex items-center px-6 py-3">
              <div className="flex items-center space-x-8">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    className="relative"
                  >
                    <NavItem
                      {...item}
                      onClick={() => setActiveItem(item.name)}
                      className={`
                        text-sm font-medium transition-all duration-300 py-2 px-4 rounded-lg relative overflow-hidden group
                        ${
                          activeItem === item.name
                            ? "text-white bg-white/15 shadow-lg"
                            : "text-white/80 hover:text-white hover:bg-white/10"
                        }
                      `}
                    />
                    {/* Active indicator line */}
                    {activeItem === item.name && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                    {/* Hover effect background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg -z-10" />
                  </motion.div>
                ))}

                {/* Separator */}
                <div className="w-px h-4 bg-gray-600"></div>

                {/* More Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowMore(!showMore)}
                    className={`
                      flex items-center space-x-1 text-sm font-medium transition-all duration-300 py-2 px-4 rounded-lg relative overflow-hidden group
                      ${showMore || activeItem === "More" ? "text-white bg-white/15 shadow-lg" : "text-white/80 hover:text-white hover:bg-white/10"}
                    `}
                  >
                    <span>More</span>
                    <ChevronDown className={`w-3 h-3 transition-all duration-300 ${showMore ? "rotate-180" : ""}`} />
                    {/* Hover effect background */}
                    {/* <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg -z-10" /> */}
                  </button>

                  <AnimatePresence>
                    {showMore && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full right-0 mt-2 w-44 bg-black/95 backdrop-blur-sm rounded-xl border border-gray-800/50 shadow-xl py-2 z-50"
                        onMouseLeave={() => setShowMore(false)}
                      >
                        {moreItems.map((item) => {
                          const IconComponent = item.icon
                          return (
                            <NavItem
                              key={item.name}
                              {...item}
                              onClick={() => {
                                setActiveItem(item.name)
                                setShowMore(false)
                              }}
                              className={`
                                flex items-center space-x-3 w-full text-left px-4 py-3 text-sm font-medium transition-all duration-300 rounded-lg mx-1 relative overflow-hidden group
                                ${
                                  activeItem === item.name
                                    ? "text-white bg-white/20 shadow-lg"
                                    : "text-white/80 hover:text-white hover:bg-white/10 hover:scale-[1.02]"
                                }
                              `}
                              renderContent={() => (
                                <>
                                  {IconComponent && (
                                    <IconComponent
                                      className={`w-4 h-4 transition-all duration-300 ${
                                        activeItem === item.name ? "text-white" : "text-white/70 group-hover:text-white"
                                      }`}
                                    />
                                  )}
                                  <span className="transition-all duration-300">{item.name}</span>
                                  {/* Hover effect background */}
                                </>
                              )}
                            />
                          )
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Audio Button */}
                <motion.button
                  onClick={togglePlay}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    p-2 rounded-lg transition-all duration-200 ml-4
                    ${isPlaying ? "bg-white/20 text-white" : "text-white/70 hover:text-white hover:bg-white/10"}
                  `}
                  aria-label={isPlaying ? "Pause music" : "Play music"}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </motion.button>
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="md:hidden flex items-center justify-between px-4 py-3">
              <div className="text-white font-medium text-sm">Menu</div>

              <div className="flex items-center space-x-2">
                <motion.button
                  onClick={togglePlay}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    p-2 rounded-lg transition-all duration-200
                    ${isPlaying ? "bg-white/20 text-white" : "text-white/70 hover:text-white hover:bg-white/10"}
                  `}
                  aria-label={isPlaying ? "Pause music" : "Play music"}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </motion.button>

                <motion.button
                  onClick={() => setIsOpen(!isOpen)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
                  aria-label="Toggle menu"
                >
                  {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.nav>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="absolute top-20 left-4 right-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-black/95 backdrop-blur-sm rounded-2xl border border-gray-800/50 shadow-xl overflow-hidden">
                <div className="p-4 space-y-1">
                  {[...navItems, ...moreItems].map((item, index) => {
                    const IconComponent = "icon" in item ? item.icon : null
                    return (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.2 }}
                      >
                        <NavItem
                          {...item}
                          onClick={() => {
                            setActiveItem(item.name)
                            setIsOpen(false)
                          }}
                          className={`
                            flex items-center space-x-3 w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 relative overflow-hidden group
                            ${
                              activeItem === item.name
                                ? "text-white bg-white/20 shadow-lg scale-[1.02]"
                                : "text-white/80 hover:text-white hover:bg-white/10 hover:scale-[1.01]"
                            }
                          `}
                          renderContent={() => (
                            <>
                              {IconComponent && (
                                <IconComponent
                                  className={`w-4 h-4 transition-all duration-300 ${
                                    activeItem === item.name ? "text-white" : "text-white/70 group-hover:text-white"
                                  }`}
                                />
                              )}
                              <span className="transition-all duration-300">{item.name}</span>
                              {/* Hover effect background */}
                              <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg -z-10" />
                            </>
                          )}
                        />
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close More dropdown */}
      {showMore && <div className="fixed inset-0 z-30" onClick={() => setShowMore(false)} />}
    </>
  )
}