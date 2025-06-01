import Link from "next/link"
import {
  Briefcase,
  Star,
  Zap,
  TrendingUp,
  ArrowRight,
  Users,
  Target,
  Award,
  Clock,
  DollarSign,
  BookOpen,
  Coffee,
  Shirt,
  Baby,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollAnimatedSection } from "@/components/ScrollAnimatedSection"
import { FloatingNames } from "@/components/FloatingNames"
import { TestimonialsSection } from "@/components/TestimonialsSection"

export default function Home() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Header */}
      <header className="container mx-auto px-4 py-4 flex items-center justify-between relative z-50">
        <ScrollAnimatedSection animation="fade-right" className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-full p-1.5 animate-pulse">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Jobify
          </span>
        </ScrollAnimatedSection>

        <nav className="hidden md:flex items-center gap-8">
          <ScrollAnimatedSection animation="fade-down" delay={0.1}>
            <Link
              href="#"
              className="text-gray-600 hover:text-orange-500 transition-all duration-300 hover:scale-105 font-medium"
            >
              Find Jobs
            </Link>
          </ScrollAnimatedSection>
          <ScrollAnimatedSection animation="fade-down" delay={0.2}>
            <Link
              href="#"
              className="text-gray-600 hover:text-orange-500 transition-all duration-300 hover:scale-105 font-medium"
            >
              Resume Help
            </Link>
          </ScrollAnimatedSection>
          <ScrollAnimatedSection animation="fade-down" delay={0.3}>
            <Link
              href="#"
              className="text-gray-600 hover:text-orange-500 transition-all duration-300 hover:scale-105 font-medium"
            >
              Interview Tips
            </Link>
          </ScrollAnimatedSection>
        </nav>

        <ScrollAnimatedSection animation="fade-left" delay={0.4}>
          <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white transition-all duration-300 hover:scale-105 font-semibold">
            Get Started
          </Button>
        </ScrollAnimatedSection>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 py-20">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <ScrollAnimatedSection animation="scale">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Land Your
                <br />
                <span className="bg-gradient-to-r from-orange-600 via-red-600 to-yellow-600 bg-clip-text text-transparent animate-gradient">
                  First Job
                </span>
              </h1>
            </ScrollAnimatedSection>

            <ScrollAnimatedSection animation="fade-up" delay={0.3}>
              <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
                Ready to start earning? We help high school students find part-time jobs, internships, and entry-level
                positions. Build your resume, ace interviews, and get hired fast! 💪
              </p>
            </ScrollAnimatedSection>

            <ScrollAnimatedSection animation="scale" delay={0.5}>
              <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-6 text-lg transition-all duration-300 hover:scale-110 hover:shadow-xl group font-semibold">
                Start Job Hunting
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </ScrollAnimatedSection>
          </div>

          <ScrollAnimatedSection animation="fade-up" delay={0.7}>
            <div className="text-center mt-16 text-gray-600 font-medium">Trusted by students at 500+ high schools</div>
          </ScrollAnimatedSection>

          <ScrollAnimatedSection animation="fade-up" delay={0.8}>
            <div className="flex justify-center gap-8 mt-6 flex-wrap">
              {[
                "McDonald's",
                "Target",
                "Starbucks",
                "Local Shops",
                "Summer Camps",
                "Tutoring",
                "Babysitting",
                "Retail",
                "Food Service",
              ].map((company, index) => (
                <div
                  key={company}
                  className="text-gray-500 opacity-70 hover:opacity-100 transition-all duration-300 hover:scale-110 animate-float font-medium"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {company}
                </div>
              ))}
            </div>
          </ScrollAnimatedSection>
        </div>

        {/* Enhanced Floating Names */}
        <FloatingNames />

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Large floating shapes */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-orange-200 to-red-300 rounded-full opacity-60 blur-xl animate-float-slow"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-yellow-200 to-orange-300 rounded-full opacity-50 blur-xl animate-float-reverse"></div>
          <div className="absolute top-40 right-1/4 w-24 h-24 bg-gradient-to-br from-red-200 to-pink-200 rounded-full opacity-70 animate-bounce-slow"></div>

          {/* Medium shapes */}
          <div className="absolute top-1/3 left-1/3 w-20 h-20 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full opacity-40 animate-float delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/5 w-28 h-28 bg-gradient-to-br from-orange-200 to-red-200 rounded-full opacity-50 animate-float-reverse delay-500"></div>

          {/* Small animated dots */}
          <div className="absolute top-1/4 right-1/3 w-4 h-4 bg-orange-400 rounded-full animate-ping"></div>
          <div className="absolute bottom-1/3 left-1/4 w-3 h-3 bg-red-400 rounded-full animate-ping delay-700"></div>
          <div className="absolute top-2/3 right-1/5 w-5 h-5 bg-yellow-400 rounded-full animate-ping delay-1000"></div>

          {/* Floating icons */}
          <div className="absolute top-1/5 left-2/3 animate-float-icon">
            <Star className="h-6 w-6 text-yellow-400 opacity-70" />
          </div>
          <div className="absolute bottom-1/4 right-2/3 animate-float-icon delay-500">
            <Zap className="h-5 w-5 text-orange-400 opacity-60" />
          </div>
          <div className="absolute top-2/3 left-1/5 animate-float-icon delay-1000">
            <TrendingUp className="h-4 w-4 text-red-400 opacity-70" />
          </div>
        </div>
      </section>

      {/* Job Categories Section */}
      <section className="py-20 container mx-auto px-4 relative">
        <ScrollAnimatedSection animation="fade-up">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-6 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Popular Jobs for Students
          </h2>
        </ScrollAnimatedSection>

        <ScrollAnimatedSection animation="fade-up" delay={0.2}>
          <p className="text-center text-gray-600 max-w-2xl mx-auto mb-16">
            Discover the most popular part-time jobs and internships that fit perfectly with your school schedule!
          </p>
        </ScrollAnimatedSection>

        <div className="grid md:grid-cols-3 gap-8">
          <ScrollAnimatedSection animation="fade-right" delay={0.1}>
            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-8 rounded-2xl hover:shadow-xl transition-all duration-500 hover:scale-105 group relative overflow-hidden border-2 border-transparent hover:border-orange-200">
              <div className="flex justify-between items-center mb-6">
                <Coffee className="h-8 w-8 text-orange-500 group-hover:animate-bounce" />
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-500 font-medium">Avg Pay</span>
                  <div className="bg-orange-200 rounded-full px-3 py-1 text-sm font-bold text-orange-700">
                    $12-15/hr
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Food Service</h3>
              <p className="text-gray-600 mb-4">
                Work at cafes, restaurants, or fast food. Great for learning customer service and teamwork!
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                  Flexible Hours
                </span>
                <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium">Tips</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          </ScrollAnimatedSection>

          <ScrollAnimatedSection animation="fade-up" delay={0.3}>
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-8 rounded-2xl hover:shadow-xl transition-all duration-500 hover:scale-105 group relative overflow-hidden border-2 border-transparent hover:border-yellow-200">
              <div className="flex justify-between items-center mb-6">
                <Shirt className="h-8 w-8 text-yellow-600 group-hover:animate-bounce" />
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-500 font-medium">Avg Pay</span>
                  <div className="bg-yellow-200 rounded-full px-3 py-1 text-sm font-bold text-yellow-700">
                    $11-14/hr
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Retail</h3>
              <p className="text-gray-600 mb-4">
                Work at clothing stores, electronics shops, or department stores. Perfect for building people skills!
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium">
                  Employee Discounts
                </span>
                <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                  Weekend Shifts
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          </ScrollAnimatedSection>

          <ScrollAnimatedSection animation="fade-left" delay={0.5}>
            <div className="bg-gradient-to-br from-red-50 to-orange-50 p-8 rounded-2xl hover:shadow-xl transition-all duration-500 hover:scale-105 group relative overflow-hidden border-2 border-transparent hover:border-red-200">
              <div className="flex justify-between items-center mb-6">
                <Baby className="h-8 w-8 text-red-500 group-hover:animate-bounce" />
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-500 font-medium">Avg Pay</span>
                  <div className="bg-red-200 rounded-full px-3 py-1 text-sm font-bold text-red-700">$15-20/hr</div>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Babysitting & Tutoring</h3>
              <p className="text-gray-600 mb-4">
                Help families with childcare or tutoring. Great pay and you set your own schedule!
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">High Pay</span>
                <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                  Flexible
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          </ScrollAnimatedSection>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-orange-50 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-20 h-20 bg-orange-200 rounded-full opacity-30 animate-float-slow"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-red-200 rounded-full opacity-40 animate-float-reverse"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <ScrollAnimatedSection animation="scale">
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              We've Got Your Back! 🚀
            </h2>
          </ScrollAnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            <ScrollAnimatedSection animation="fade-up" delay={0.1}>
              <div className="text-center group">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:animate-spin transition-all duration-500 group-hover:scale-110">
                  <BookOpen className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">Resume Builder</h3>
                <p className="text-gray-600">
                  Never written a resume? No problem! Our easy builder helps you create a professional resume in
                  minutes, even with zero experience.
                </p>
              </div>
            </ScrollAnimatedSection>

            <ScrollAnimatedSection animation="fade-up" delay={0.3}>
              <div className="text-center group">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:animate-spin transition-all duration-500 group-hover:scale-110">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">Interview Prep</h3>
                <p className="text-gray-600">
                  Nervous about interviews? We'll teach you exactly what to say and how to act. Practice with our mock
                  interviews and nail the real thing!
                </p>
              </div>
            </ScrollAnimatedSection>

            <ScrollAnimatedSection animation="fade-up" delay={0.5}>
              <div className="text-center group">
                <div className="bg-gradient-to-r from-red-500 to-orange-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:animate-spin transition-all duration-500 group-hover:scale-110">
                  <Target className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">Job Matching</h3>
                <p className="text-gray-600">
                  Tell us your schedule, interests, and location. We'll find jobs that actually work for you - no more
                  endless scrolling through irrelevant listings!
                </p>
              </div>
            </ScrollAnimatedSection>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-20 h-20 bg-orange-200 rounded-full opacity-30 animate-float-slow"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-red-200 rounded-full opacity-40 animate-float-reverse"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-yellow-200 rounded-full opacity-50 animate-bounce-slow"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <ScrollAnimatedSection animation="rotate">
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Why Students Love Jobify
            </h2>
          </ScrollAnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            <ScrollAnimatedSection animation="slide-up" delay={0.1}>
              <div className="bg-white p-8 rounded-2xl text-center hover:shadow-2xl transition-all duration-500 hover:scale-105 group relative overflow-hidden border-2 border-transparent hover:border-orange-200">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:animate-spin transition-all duration-500">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">Flexible Scheduling</h3>
                <p className="text-gray-600">
                  Find jobs that work around your school schedule, sports, and social life. We get it - you're busy!
                </p>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </ScrollAnimatedSection>

            <ScrollAnimatedSection animation="slide-up" delay={0.3}>
              <div className="bg-white p-8 rounded-2xl text-center hover:shadow-2xl transition-all duration-500 hover:scale-105 group relative overflow-hidden border-2 border-transparent hover:border-yellow-200">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:animate-spin transition-all duration-500">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">Start Earning Now</h3>
                <p className="text-gray-600">
                  Make money for college, car payments, or just having fun. Financial independence starts here!
                </p>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </ScrollAnimatedSection>

            <ScrollAnimatedSection animation="slide-up" delay={0.5}>
              <div className="bg-white p-8 rounded-2xl text-center hover:shadow-2xl transition-all duration-500 hover:scale-105 group relative overflow-hidden border-2 border-transparent hover:border-red-200">
                <div className="bg-gradient-to-r from-red-500 to-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:animate-spin transition-all duration-500">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">Build Your Future</h3>
                <p className="text-gray-600">
                  Gain real work experience, build your network, and develop skills that will help you in college and
                  beyond.
                </p>
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </ScrollAnimatedSection>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollAnimatedSection animation="scale">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Ready to Get Your First Job? 🎉
            </h2>
          </ScrollAnimatedSection>

          <ScrollAnimatedSection animation="fade-up" delay={0.2}>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of students who are already earning money and building their futures. It's free to get
              started!
            </p>
          </ScrollAnimatedSection>

          <ScrollAnimatedSection animation="scale" delay={0.4}>
            <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-6 text-lg transition-all duration-300 hover:scale-110 hover:shadow-xl group font-semibold">
              Start Job Hunting Now
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </ScrollAnimatedSection>

          <ScrollAnimatedSection animation="fade-up" delay={0.6}>
            <p className="text-sm text-gray-500 mt-4">100% Free • No Credit Card Required • Get Started in 2 Minutes</p>
          </ScrollAnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-orange-50 to-red-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <ScrollAnimatedSection animation="fade-right">
              <div className="flex items-center gap-2 mb-6 md:mb-0">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-full p-1.5 animate-pulse">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Jobify
                </span>
              </div>
            </ScrollAnimatedSection>

            <div className="flex gap-8">
              <ScrollAnimatedSection animation="fade-up" delay={0.1}>
                <Link
                  href="#"
                  className="text-gray-600 hover:text-orange-500 transition-all duration-300 hover:scale-105 font-medium"
                >
                  Privacy
                </Link>
              </ScrollAnimatedSection>
              <ScrollAnimatedSection animation="fade-up" delay={0.2}>
                <Link
                  href="#"
                  className="text-gray-600 hover:text-orange-500 transition-all duration-300 hover:scale-105 font-medium"
                >
                  Terms
                </Link>
              </ScrollAnimatedSection>
              <ScrollAnimatedSection animation="fade-up" delay={0.3}>
                <Link
                  href="#"
                  className="text-gray-600 hover:text-orange-500 transition-all duration-300 hover:scale-105 font-medium"
                >
                  Help
                </Link>
              </ScrollAnimatedSection>
            </div>
          </div>

          <ScrollAnimatedSection animation="fade-up" delay={0.4}>
            <div className="text-center mt-8 text-gray-500 text-sm">
              © {new Date().getFullYear()} Jobify. Made with ❤️ for students by students.
            </div>
          </ScrollAnimatedSection>
        </div>
      </footer>
    </div>
  )
}
