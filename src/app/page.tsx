"use client";
import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  BarChart3,
  Users,
  FileText,
  Wrench,
  TrendingUp,
  Lock,
  Menu,
  X,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  Globe,
  Star,
} from "lucide-react";

export default function App() {
  const [isVisible, setIsVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const { scrollYProgress } = useScroll();
  const router = useRouter();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    setIsVisible(true);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const features = [
    {
      icon: <BarChart3 className="w-7 h-7" />,
      title: "Real-time Tracking",
      description:
        "Monitor all your company assets in real-time with live updates and instant notifications",
      color: "from-[#b9392c] to-[#d94435]",
    },
    {
      icon: <Users className="w-7 h-7" />,
      title: "Role-Based Access",
      description:
        "Admin, Manager, Employee, and Viewer roles with granular permission controls",
      color: "from-[#8f2d22] to-[#b9392c]",
    },
    {
      icon: <FileText className="w-7 h-7" />,
      title: "Audit Trail",
      description:
        "Complete history of all asset movements, assignments, and modifications",
      color: "from-[#d94435] to-[#b9392c]",
    },
    {
      icon: <Wrench className="w-7 h-7" />,
      title: "Maintenance Alerts",
      description:
        "Automated maintenance schedules and service reminders for all assets",
      color: "from-[#b9392c] to-[#8f2d22]",
    },
    {
      icon: <TrendingUp className="w-7 h-7" />,
      title: "Analytics Dashboard",
      description:
        "Advanced analytics and reports to optimize asset utilization",
      color: "from-[#d94435] to-[#8f2d22]",
    },
    {
      icon: <Lock className="w-7 h-7" />,
      title: "Enterprise Security",
      description:
        "Bank-grade encryption and secure authentication for your data",
      color: "from-[#8f2d22] to-[#d94435]",
    },
  ];

  const stats = [
    { value: "99.9%", label: "Uptime", icon: <Zap className="w-6 h-6" /> },
    { value: "24/7", label: "Support", icon: <Shield className="w-6 h-6" /> },
    { value: "500+", label: "Clients", icon: <Globe className="w-6 h-6" /> },
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Custom Cursor Effect */}
      <motion.div
        className="fixed w-96 h-96 rounded-full pointer-events-none z-0 mix-blend-soft-light"
        style={{
          background:
            "radial-gradient(circle, rgba(185,57,44,0.15) 0%, transparent 70%)",
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
      />

      {/* Animated Grid Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(#b9392c 1px, transparent 1px), linear-gradient(90deg, #b9392c 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Floating Shapes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            y: [0, -30, 0],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 right-[10%] w-32 h-32 border-2 border-[#b9392c]/10 rounded-3xl rotate-45"
        />
        <motion.div
          animate={{
            y: [0, 40, 0],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-20 left-[15%] w-24 h-24 border-2 border-[#b9392c]/10 rounded-full"
        />
        <motion.div
          animate={{
            y: [0, -50, 0],
            x: [0, 30, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 right-[5%] w-20 h-20 bg-gradient-to-br from-[#b9392c]/5 to-transparent rounded-2xl rotate-12"
        />
      </div>

      {/* Navigation Bar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-100"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <motion.div
              className="flex items-center space-x-3 relative z-10"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="relative w-12 h-12"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              >
                <Image
                  src="/AssetIQ.png"
                  alt="AssetIQ Logo"
                  width={48}
                  height={48}
                  className="rounded-2xl"
                />
              </motion.div>
              <span className="text-gray-900 text-2xl tracking-tight">
                Asset<span className="text-[#b9392c]">IQ</span>
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {["Features", "Pricing", "About", "Contact"].map(
                (item, index) => (
                  <motion.a
                    key={item}
                    href="#"
                    className="relative px-4 py-2 text-gray-700 hover:text-[#b9392c] transition-colors group"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {item}
                    <motion.span
                      className="absolute bottom-0 left-1/2 h-0.5 bg-[#b9392c] -translate-x-1/2"
                      initial={{ width: 0 }}
                      whileHover={{ width: "60%" }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.a>
                ),
              )}
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/login")}
                className="px-5 py-2.5 text-gray-700 hover:text-[#b9392c] transition-colors relative group cursor-pointer"
              >
                Login
                <span className="absolute inset-0 border border-transparent group-hover:border-[#b9392c]/20 rounded-xl transition-all" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative px-6 py-2.5 text-white rounded-xl overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#b9392c] to-[#8f2d22]" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#8f2d22] to-[#b9392c] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10 flex items-center gap-2">
                  Get Started
                  <Sparkles className="w-4 h-4" />
                </span>
              </motion.button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-900 relative z-10"
            >
              <motion.div
                animate={{ rotate: mobileMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </motion.div>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-6 border-t border-gray-100"
            >
              <div className="flex flex-col space-y-4">
                {["Features", "Pricing", "About", "Contact"].map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="text-gray-700 hover:text-[#b9392c] transition-colors py-2"
                  >
                    {item}
                  </a>
                ))}
                <button
                  onClick={() => router.push("/login")}
                  className="px-6 py-2.5 text-gray-700 hover:text-[#b9392c] transition-colors text-left cursor-pointer"
                >
                  Login
                </button>
                <button className="px-6 py-2.5 bg-gradient-to-r from-[#b9392c] to-[#8f2d22] text-white rounded-xl">
                  Get Started
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 md:pt-48 pb-20 md:pb-40 overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial="hidden"
              animate={isVisible ? "visible" : "hidden"}
              variants={staggerContainer}
              className="relative z-10"
            >
              {/* Badge */}
              <motion.div
                variants={fadeInUp}
                className="inline-block mb-6 md:mb-8"
              >
                <motion.span
                  className="px-5 py-2.5 bg-gradient-to-r from-[#b9392c]/10 to-transparent rounded-full text-sm md:text-base text-[#b9392c] border border-[#b9392c]/20 inline-flex items-center gap-2 backdrop-blur-sm"
                  whileHover={{
                    scale: 1.05,
                    borderColor: "rgba(185, 57, 44, 0.4)",
                  }}
                >
                  <Star className="w-4 h-4 fill-[#b9392c]" />
                  Enterprise Asset Management
                </motion.span>
              </motion.div>

              {/* Main Heading */}
              <motion.h1
                variants={fadeInUp}
                className="text-5xl md:text-7xl lg:text-8xl text-gray-900 mb-6 md:mb-8 leading-[1.1] tracking-tight"
              >
                Track,
                <br />
                <span className="relative inline-block">
                  <span className="text-[#b9392c]">Manage</span>
                  <motion.span
                    className="absolute -bottom-2 left-0 right-0 h-3 bg-[#b9392c]/10 -z-10"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 1, duration: 0.8 }}
                  />
                </span>
                <br />& Optimize
              </motion.h1>

              {/* Subheading */}
              <motion.p
                variants={fadeInUp}
                className="text-lg md:text-xl text-gray-600 mb-10 md:mb-12 leading-relaxed max-w-xl"
              >
                Centralized asset tracking with real-time insights, role-based
                access, and complete audit trails. Everything you need in one
                place.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative px-8 py-4 rounded-2xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#b9392c] to-[#8f2d22]" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#8f2d22] to-[#b9392c] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="relative z-10 flex items-center justify-center gap-2 text-white font-semibold">
                    Get Started Free
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white text-gray-900 rounded-2xl font-semibold border-2 border-gray-200 hover:border-[#b9392c] hover:text-[#b9392c] transition-all inline-flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                >
                  Watch Demo
                </motion.button>
              </motion.div>

              {/* Trust Badges */}
              <motion.div
                variants={fadeInUp}
                className="mt-12 flex items-center gap-6 flex-wrap"
              >
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-[#b9392c] to-[#8f2d22] border-2 border-white flex items-center justify-center text-white text-xs font-semibold"
                      >
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    500+ companies trust us
                  </span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Visual */}
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative hidden lg:block"
            >
              {/* Main Card */}
              <motion.div style={{ y }} className="relative">
                <div className="relative bg-gradient-to-br from-gray-50 to-white border-2 border-gray-100 rounded-3xl p-8 shadow-2xl">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {stats.map((stat, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#b9392c] to-[#8f2d22] flex items-center justify-center text-white">
                            {stat.icon}
                          </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">
                          {stat.value}
                        </div>
                        <div className="text-sm text-gray-600">
                          {stat.label}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Progress Bars */}
                  <div className="space-y-4">
                    {["Asset Tracking", "Performance"].map((label, index) => (
                      <div key={label}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-gray-600">{label}</span>
                          <span className="text-sm font-semibold text-[#b9392c]">
                            {95 - index * 5}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-[#b9392c] to-[#8f2d22]"
                            initial={{ width: 0 }}
                            animate={{ width: `${95 - index * 5}%` }}
                            transition={{
                              delay: 1 + index * 0.2,
                              duration: 1,
                              ease: "easeOut",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floating Elements */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-[#b9392c] to-[#8f2d22] rounded-2xl shadow-xl flex items-center justify-center text-white rotate-12"
                >
                  <TrendingUp className="w-12 h-12" />
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -bottom-6 -left-6 w-20 h-20 bg-white border-2 border-[#b9392c] rounded-2xl shadow-xl flex items-center justify-center -rotate-12"
                >
                  <Shield className="w-10 h-10 text-[#b9392c]" />
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Decorative Element */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-[#b9392c]/20 to-transparent" />

        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-16 md:mb-20"
          >
            <motion.div variants={fadeInUp} className="inline-block mb-4">
              <span className="text-[#b9392c] font-semibold text-sm tracking-wider uppercase">
                Features
              </span>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              className="text-4xl md:text-6xl text-gray-900 mb-6 tracking-tight"
            >
              Everything you need
              <br />
              <span className="text-[#b9392c]">in one place</span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto"
            >
              Powerful features to help you track, monitor, and optimize your
              asset lifecycle
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative bg-white rounded-3xl p-8 border-2 border-gray-100 hover:border-[#b9392c]/30 transition-all duration-500 cursor-pointer overflow-hidden"
              >
                {/* Gradient Background on Hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                />

                {/* Icon */}
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className={`relative w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg`}
                >
                  {feature.icon}
                  <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#b9392c] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  {feature.description}
                </p>

                {/* Arrow */}
                <motion.div
                  className="flex items-center gap-2 text-[#b9392c] opacity-0 group-hover:opacity-100 transition-opacity"
                  whileHover={{ x: 5 }}
                >
                  <span className="text-sm font-semibold">Learn more</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.div>

                {/* Corner Accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#b9392c]/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#b9392c] via-[#8f2d22] to-[#b9392c]" />

        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          {[
            { left: "10%", top: "20%", duration: 5, delay: 0 },
            { left: "85%", top: "15%", duration: 7, delay: 0.5 },
            { left: "30%", top: "70%", duration: 6, delay: 1 },
            { left: "70%", top: "80%", duration: 8, delay: 0.3 },
            { left: "50%", top: "40%", duration: 5.5, delay: 0.8 },
            { left: "15%", top: "85%", duration: 7.5, delay: 1.2 },
            { left: "90%", top: "50%", duration: 6.5, delay: 0.2 },
            { left: "45%", top: "90%", duration: 5.8, delay: 1.5 },
            { left: "75%", top: "25%", duration: 7.2, delay: 0.7 },
            { left: "25%", top: "55%", duration: 6.8, delay: 1.1 },
            { left: "60%", top: "10%", duration: 5.3, delay: 0.4 },
            { left: "5%", top: "45%", duration: 7.8, delay: 1.3 },
            { left: "95%", top: "75%", duration: 6.2, delay: 0.6 },
            { left: "40%", top: "30%", duration: 5.6, delay: 0.9 },
            { left: "80%", top: "65%", duration: 7.1, delay: 1.4 },
            { left: "20%", top: "95%", duration: 6.4, delay: 0.1 },
            { left: "65%", top: "35%", duration: 5.9, delay: 0.8 },
            { left: "35%", top: "60%", duration: 7.4, delay: 1.6 },
            { left: "55%", top: "5%", duration: 6.1, delay: 0.5 },
            { left: "12%", top: "50%", duration: 5.7, delay: 1.7 },
          ].map((circle, i) => (
            <motion.div
              key={i}
              className="absolute w-32 h-32 border border-white rounded-full"
              style={{
                left: circle.left,
                top: circle.top,
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: circle.duration,
                repeat: Infinity,
                delay: circle.delay,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-4xl md:text-6xl lg:text-7xl text-white mb-6 md:mb-8 tracking-tight leading-tight"
            >
              Ready to streamline your
              <br />
              <span className="relative inline-block">
                asset management?
                <motion.span
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-white/30"
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                />
              </span>
            </motion.h2>

            <motion.p
              variants={fadeInUp}
              className="text-white/90 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              Join thousands of companies using AssetIQ to manage their assets
              efficiently
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="group px-10 py-5 bg-white text-[#b9392c] rounded-2xl font-semibold shadow-2xl hover:shadow-3xl transition-all inline-flex items-center gap-3"
              >
                Start Free Trial
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-5 bg-white/10 backdrop-blur-sm text-white rounded-2xl font-semibold border-2 border-white/20 hover:bg-white/20 transition-all"
              >
                Talk to Sales
              </motion.button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              variants={fadeInUp}
              className="mt-12 flex flex-wrap justify-center gap-8 text-white/80 text-sm"
            >
              {[
                "No credit card required",
                "14-day free trial",
                "Cancel anytime",
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  {text}
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-gray-900 py-16 md:py-20 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#b9392c]/30 to-transparent" />

        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">
            <div className="col-span-2 md:col-span-1">
              <motion.div
                className="flex items-center space-x-3 mb-4"
                whileHover={{ scale: 1.05 }}
              >
                <div className="relative w-12 h-12">
                  <Image
                    src="/AssetIQ.png"
                    alt="AssetIQ Logo"
                    width={48}
                    height={48}
                    className="rounded-2xl"
                  />
                </div>
                <span className="text-white text-2xl tracking-tight">
                  Asset<span className="text-[#b9392c]">IQ</span>
                </span>
              </motion.div>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Modern asset management solution for forward-thinking companies.
              </p>
              <div className="flex gap-3">
                {["Twitter", "LinkedIn", "GitHub"].map((social, i) => (
                  <motion.a
                    key={social}
                    href="#"
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="w-10 h-10 rounded-xl bg-gray-800 hover:bg-[#b9392c] flex items-center justify-center text-gray-400 hover:text-white transition-all"
                  >
                    <div className="w-5 h-5 rounded-full bg-current" />
                  </motion.a>
                ))}
              </div>
            </div>

            {[
              {
                title: "Product",
                links: ["Features", "Pricing", "Integrations", "API"],
              },
              {
                title: "Company",
                links: ["About Us", "Blog", "Careers", "Contact"],
              },
              {
                title: "Legal",
                links: [
                  "Privacy Policy",
                  "Terms of Service",
                  "Security",
                  "GDPR",
                ],
              },
            ].map((section, i) => (
              <div key={section.title}>
                <h4 className="text-white font-semibold mb-4 text-lg">
                  {section.title}
                </h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link}>
                      <motion.a
                        href="#"
                        className="text-gray-400 hover:text-[#b9392c] transition text-sm inline-block"
                        whileHover={{ x: 5 }}
                      >
                        {link}
                      </motion.a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm">
              © 2026 AssetIQ. All rights reserved.
            </div>
            <div className="flex gap-6 text-gray-400 text-sm">
              <a href="#" className="hover:text-[#b9392c] transition">
                Privacy
              </a>
              <a href="#" className="hover:text-[#b9392c] transition">
                Terms
              </a>
              <a href="#" className="hover:text-[#b9392c] transition">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
