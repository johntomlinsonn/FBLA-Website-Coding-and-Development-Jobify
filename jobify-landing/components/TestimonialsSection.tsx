"use client"
import { ScrollAnimatedSection } from "./ScrollAnimatedSection"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    id: 1,
    name: "Alex Chen",
    age: 17,
    school: "Lincoln High School",
    job: "Barista at Local Coffee Shop",
    content:
      "Jobify helped me land my first job! The resume builder was super easy to use and the interview tips gave me confidence. Now I'm earning money for college!",
    rating: 5,
    avatar: "AC",
  },
  {
    id: 2,
    name: "Maya Rodriguez",
    age: 16,
    school: "Roosevelt High School",
    job: "Retail Associate at Target",
    content:
      "I was so nervous about my first job interview, but Jobify's prep course made it easy. Got hired on the spot!",
    rating: 5,
    avatar: "MR",
  },
  {
    id: 3,
    name: "Jordan Smith",
    age: 18,
    school: "Washington High School",
    job: "Summer Camp Counselor",
    content:
      "Found an amazing summer internship through Jobify! The platform made it so simple to apply and track my applications.",
    rating: 5,
    avatar: "JS",
  },
  {
    id: 4,
    name: "Taylor Kim",
    age: 17,
    school: "Jefferson High School",
    job: "Tutor & Babysitter",
    content:
      "Jobify connected me with families in my neighborhood who needed tutoring help. Perfect flexible job for my schedule!",
    rating: 5,
    avatar: "TK",
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-orange-200 to-red-200 rounded-full opacity-30 animate-float-slow"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full opacity-40 animate-float-reverse"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-red-200 to-pink-200 rounded-full opacity-35 animate-bounce-slow"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <ScrollAnimatedSection animation="fade-up" className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Real Students, Real Success Stories
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See how other high schoolers landed their first jobs and started earning money!
          </p>
        </ScrollAnimatedSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {testimonials.map((testimonial, index) => (
            <ScrollAnimatedSection
              key={testimonial.id}
              animation={index % 2 === 0 ? "fade-up" : "fade-down"}
              delay={index * 0.2}
              className="group"
            >
              <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 relative overflow-hidden border-2 border-transparent hover:border-orange-200">
                {/* Quote icon */}
                <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Quote className="h-8 w-8 text-orange-500" />
                </div>

                {/* Avatar */}
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center text-white font-bold mr-4 group-hover:animate-pulse">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">Age {testimonial.age}</p>
                    <p className="text-xs text-orange-600 font-medium">{testimonial.school}</p>
                  </div>
                </div>

                {/* Job badge */}
                <div className="bg-gradient-to-r from-orange-100 to-yellow-100 rounded-full px-3 py-1 mb-4 inline-block">
                  <p className="text-xs font-semibold text-orange-700">{testimonial.job}</p>
                </div>

                {/* Rating */}
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 text-yellow-400 fill-current group-hover:animate-bounce"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>

                {/* Content */}
                <p className="text-gray-700 text-sm leading-relaxed">{testimonial.content}</p>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </ScrollAnimatedSection>
          ))}
        </div>

        {/* Stats section */}
        <ScrollAnimatedSection animation="scale" delay={0.5} className="mt-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2 group-hover:animate-bounce">
                5k+
              </div>
              <div className="text-gray-600">Students Hired</div>
            </div>
            <div className="group">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2 group-hover:animate-bounce">
                92%
              </div>
              <div className="text-gray-600">Success Rate</div>
            </div>
            <div className="group">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2 group-hover:animate-bounce">
                200+
              </div>
              <div className="text-gray-600">Partner Businesses</div>
            </div>
            <div className="group">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent mb-2 group-hover:animate-bounce">
                4.8★
              </div>
              <div className="text-gray-600">Student Rating</div>
            </div>
          </div>
        </ScrollAnimatedSection>
      </div>
    </section>
  )
}
