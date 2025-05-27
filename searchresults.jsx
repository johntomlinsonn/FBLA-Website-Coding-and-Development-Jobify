"use client"

import { useEffect, useState, useRef } from "react"
import "./JobifyLanding.css"
import {
  Search,
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  FileText,
  CheckCircle,
  X,
  Building,
  Bookmark,
  TrendingUp,
} from "lucide-react"

export default function JobifyLanding() {
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [recentSearches, setRecentSearches] = useState(["marketing intern", "part time retail", "remote developer"])
  const [jobResults, setJobResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const searchInputRef = useRef(null)
  const searchOverlayRef = useRef(null)
  
  // Define popularSearches array to fix "map is not a function" error
  const popularSearches = [
    "remote jobs",
    "part time",
    "internship",
    "summer jobs",
    "entry level",
    "no experience"
  ]

  // Fetch jobs from backend
  const fetchJobs = async (query = "") => {
    setIsLoading(true)
    try {
      // Updated endpoint to match the correct Django API endpoint
      const response = await fetch(`/api/search/?search=${encodeURIComponent(query)}`)
      if (!response.ok) throw new Error('Network response was not ok')
      const data = await response.json()
      console.log("Jobs data received:", data); // For debugging
      // Ensure jobResults is always an array
      setJobResults(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching jobs:', error)
      setJobResults([]) // Set to empty array on error
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch initial jobs on component mount
  useEffect(() => {
    fetchJobs()
  }, [])

  // Handle search input focus
  const handleSearchFocus = () => {
    setIsSearchActive(true)
  }

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  // Handle search submission
  const handleSearchSubmit = async (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      if (!recentSearches.includes(searchQuery.toLowerCase().trim())) {
        setRecentSearches((prev) => [searchQuery.toLowerCase().trim(), ...prev.slice(0, 4)])
      }
      await fetchJobs(searchQuery)
      setIsSearchActive(false)
    }
  }

  // Handle clicking a recent or popular search
  const handleSearchClick = (term) => {
    setSearchQuery(term)
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }

  // Close search overlay
  const closeSearchOverlay = () => {
    setIsSearchActive(false)
  }

  // Handle click outside to close search overlay
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchOverlayRef.current &&
        !searchOverlayRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setIsSearchActive(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Animation on scroll functionality
  useEffect(() => {
    const animateOnScroll = () => {
      const elements = document.querySelectorAll(".animate-on-scroll")

      elements.forEach((element) => {
        const elementPosition = element.getBoundingClientRect().top
        const windowHeight = window.innerHeight

        // If element is in viewport
        if (elementPosition < windowHeight - 100) {
          element.classList.add("animate")
        }
      })
    }

    // Run once on initial load
    animateOnScroll()

    // Add scroll event listener
    window.addEventListener("scroll", animateOnScroll)

    // Clean up
    return () => {
      window.removeEventListener("scroll", animateOnScroll)
    }
  }, [])

  // Handle escape key to close search
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === "Escape" && isSearchActive) {
        setIsSearchActive(false)
      }
    }

    window.addEventListener("keydown", handleEscKey)
    return () => {
      window.removeEventListener("keydown", handleEscKey)
    }
  }, [isSearchActive])

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays <= 7) return `${diffDays} days ago`
    if (diffDays <= 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  return (
    <div className="jobify-container">
      {/* Header */}
      <header className="header">
        <div className="header-container">
          <a href="/" className="logo">
            <Briefcase className="logo-icon" />
            <span className="logo-text">Jobify</span>
          </a>
          <nav className="main-nav">
            <a href="#" className="nav-link">
              Find Jobs
            </a>
            <a href="#" className="nav-link">
              Companies
            </a>
            <a href="#" className="nav-link">
              Resources
            </a>
            <a href="#" className="nav-link">
              About Us
            </a>
          </nav>
          <div className="header-buttons">
            <a href="/post-job" className="btn btn-outline">
              Post a Job
            </a>
            <a href="/register" className="btn btn-outline">
              Register
            </a>
            <a href="/login" className="btn btn-primary">
              Log In
            </a>
          </div>
          <button className="mobile-menu-btn">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title animate-on-scroll fade-in">Helping students find their perfect job</h1>
          <p className="hero-subtitle animate-on-scroll fade-in" style={{ animationDelay: "0.2s" }}>
            Connect with thousands of employers looking for talented students just like you
          </p>
          <form
            onSubmit={handleSearchSubmit}
            className="search-container animate-on-scroll fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="search-input-wrapper">
              <Search className="search-icon-input" />
              <input
                type="text"
                placeholder="Job title, company, or keywords"
                className="search-input"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                ref={searchInputRef}
              />
              {searchQuery && (
                <button type="button" className="clear-search-btn" onClick={() => setSearchQuery("")}>
                  <X size={16} />
                </button>
              )}
            </div>
            <button type="submit" className="search-button">
              <Search className="search-icon" />
              Search Jobs
            </button>
          </form>
        </div>
      </section>

      {/* Search Overlay */}
      {isSearchActive && (
        <div className="search-overlay" ref={searchOverlayRef}>
          <div className="search-overlay-content">
            {searchQuery && jobResults.length > 0 ? (
              <div className="search-results">
                <h3 className="search-section-title">Job Results</h3>
                <ul className="search-results-list">
                  {jobResults.map((job) => (
                    <li key={job.id} className="search-result-item">
                      <a href="#" className="search-result-link">
                        <div className="search-result-icon">
                          <Briefcase size={18} />
                        </div>
                        <div className="search-result-info">
                          <h4 className="search-result-title">{job.title}</h4>
                          <div className="search-result-details">
                            <span className="search-result-company">
                              <Building size={14} /> {job.company_name}
                            </span>
                            <span className="search-result-location">
                              <MapPin size={14} /> {job.location}
                            </span>
                            <span className="search-result-type">
                              <Clock size={14} /> {job.type || 'Full-time'}
                            </span>
                          </div>
                        </div>
                        <div className="search-result-action">
                          <Bookmark size={16} />
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
                <div className="search-view-all">
                  <a href="#" className="search-view-all-link">
                    View all results for "{searchQuery}"
                  </a>
                </div>
              </div>
            ) : (
              <>
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="search-section">
                    <h3 className="search-section-title">Recent Searches</h3>
                    <ul className="search-tags">
                      {recentSearches.map((term, index) => (
                        <li key={index} className="search-tag">
                          <button className="search-tag-btn" onClick={() => handleSearchClick(term)}>
                            <Clock size={14} />
                            {term}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Popular Searches */}
                <div className="search-section">
                  <h3 className="search-section-title">Popular Searches</h3>
                  <ul className="search-tags">
                    {popularSearches.map((term, index) => (
                      <li key={index} className="search-tag">
                        <button className="search-tag-btn" onClick={() => handleSearchClick(term)}>
                          <TrendingUp size={14} />
                          {term}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            <div className="search-overlay-footer">
              <div className="search-tips">
                <p>
                  <strong>Search Tips:</strong> Use specific keywords like "part-time" or "remote" for better results
                </p>
              </div>
              <button className="search-close-btn" onClick={closeSearchOverlay}>
                Close <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Job Categories */}
      <JobCategories />

      {/* Updated Featured Jobs Section */}
      <section className="jobs-section">
        <div className="container">
          <div className="section-header animate-on-scroll fade-in">
            <h2 className="section-title">Job Search Results</h2>
            <p className="section-subtitle">Found {jobResults.length} opportunities matching your criteria</p>
          </div>
          {isLoading ? (
            <div className="loading-spinner">Loading...</div>
          ) : (
          <div className="jobs-grid">
            {Array.isArray(jobResults) && jobResults.length > 0 ? (
              jobResults.map((job) => (
                <a
                  key={job.id}
                  href={`/apply/${job.id}`}
                  className="job-card animate-on-scroll slide-up"
                >
                  <div className="job-card-header">
                    <div className="job-info">
                      <div>
                        <h3 className="job-title">{job.title}</h3>
                        <p className="company-name">{job.company_name}</p>
                      </div>
                    </div>
                    <span className="job-type">{job.type || 'Full-time'}</span>
                  </div>
                  <div className="job-details">
                    <div className="job-detail">
                      <MapPin className="detail-icon" />
                      <span>{job.location}</span>
                    </div>
                    <div className="job-detail">
                      <DollarSign className="detail-icon" />
                      <span>{job.salary}</span>
                    </div>
                    <div className="job-detail">
                      <Clock className="detail-icon" />
                      <span>{formatDate(job.posted_date)}</span>
                    </div>
                  </div>
                  <p className="job-description">{job.description?.slice(0, 150)}...</p>
                  <button className="apply-btn">Apply Now</button>
                </a>
              ))
            ) : (
              <div className="no-results">No job results found. Try adjusting your search criteria.</div>
            )}
          </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <HowItWorks />

      {/* Testimonials */}
      <Testimonials />

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <div className="cta-text animate-on-scroll slide-right">
              <h2 className="section-title">Ready to start your career journey?</h2>
              <p className="section-subtitle">
                Join thousands of students who have found their dream jobs through Jobify.
              </p>
            </div>
            <div className="cta-buttons animate-on-scroll slide-left">
              <button className="btn btn-primary">Find Jobs</button>
              <button className="btn btn-outline">Post a Job</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-column animate-on-scroll fade-in">
            <a href="/" className="logo">
              <Briefcase className="logo-icon" />
              <span className="logo-text">Jobify</span>
            </a>
            <p className="footer-text">Connecting students with their dream jobs since 2015.</p>
          </div>
          <div className="footer-column animate-on-scroll fade-in" style={{ animationDelay: "0.1s" }}>
            <h3 className="footer-title">For Job Seekers</h3>
            <ul className="footer-links">
              <li>
                <a href="#">Browse Jobs</a>
              </li>
              <li>
                <a href="#">Career Resources</a>
              </li>
              <li>
                <a href="#">Resume Builder</a>
              </li>
              <li>
                <a href="#">Job Alerts</a>
              </li>
            </ul>
          </div>
          <div className="footer-column animate-on-scroll fade-in" style={{ animationDelay: "0.2s" }}>
            <h3 className="footer-title">For Employers</h3>
            <ul className="footer-links">
              <li>
                <a href="#">Post a Job</a>
              </li>
              <li>
                <a href="#">Browse Candidates</a>
              </li>
              <li>
                <a href="#">Pricing</a>
              </li>
              <li>
                <a href="#">Employer Resources</a>
              </li>
            </ul>
          </div>
          <div className="footer-column animate-on-scroll fade-in" style={{ animationDelay: "0.3s" }}>
            <h3 className="footer-title">Company</h3>
            <ul className="footer-links">
              <li>
                <a href="#">About Us</a>
              </li>
              <li>
                <a href="#">Contact</a>
              </li>
              <li>
                <a href="#">Privacy Policy</a>
              </li>
              <li>
                <a href="#">Terms of Service</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="copyright">© {new Date().getFullYear()} Jobify. All rights reserved.</p>
          <div className="social-links">
            <a href="#" className="social-link">
              <span className="sr-only">Twitter</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
              </svg>
            </a>
            <a href="#" className="social-link">
              <span className="sr-only">Facebook</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
            <a href="#" className="social-link">
              <span className="sr-only">Instagram</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
              </svg>
            </a>
            <a href="#" className="social-link">
              <span className="sr-only">LinkedIn</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect width="4" height="12" x="2" y="9"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function JobCategories() {
  // Component code remains the same
  const categories = [
    {
      title: "Technology",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="16 18 22 12 16 6"></polyline>
          <polyline points="8 6 2 12 8 18"></polyline>
        </svg>
      ),
      count: 1243,
    },
    {
      title: "Education",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
        </svg>
      ),
      count: 873,
    },
    {
      title: "Retail",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
      ),
      count: 1156,
    },
    {
      title: "Food Service",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path>
          <path d="M7 2v20"></path>
          <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path>
        </svg>
      ),
      count: 945,
    },
    {
      title: "Healthcare",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
          <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"></path>
        </svg>
      ),
      count: 678,
    },
    {
      title: "Office Admin",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
          <path d="M9 22v-4h6v4"></path>
          <path d="M8 6h.01"></path>
          <path d="M16 6h.01"></path>
          <path d="M12 6h.01"></path>
          <path d="M12 10h.01"></path>
          <path d="M12 14h.01"></path>
          <path d="M16 10h.01"></path>
          <path d="M16 14h.01"></path>
          <path d="M8 10h.01"></path>
          <path d="M8 14h.01"></path>
        </svg>
      ),
      count: 531,
    },
    {
      title: "Logistics",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 3v18h18"></path>
          <path d="m19 9-5 5-4-4-3 3"></path>
        </svg>
      ),
      count: 423,
    },
    {
      title: "All Categories",
      icon: <Briefcase />,
      count: 5000,
    },
  ]

  return (
    <section className="categories-section">
      <div className="container">
        <div className="section-header animate-on-scroll fade-in">
          <h2 className="section-title">Browse Job Categories</h2>
          <p className="section-subtitle">Explore opportunities across various industries tailored for students</p>
        </div>
        <div className="categories-grid">
          {categories.map((category, index) => (
            <a
              key={index}
              href="#"
              className="category-card animate-on-scroll zoom-in"
              style={{ animationDelay: `${0.1 * index}s` }}
            >
              <div className="category-icon">{category.icon}</div>
              <h3 className="category-title">{category.title}</h3>
              <p className="category-count">{category.count} jobs</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeaturedJobs() {
  // Component code remains the same
  const jobs = [
    {
      id: 1,
      title: "Retail Sales Associate",
      company: "Urban Outfitters",
      location: "New York, NY",
      type: "Part-time",
      salary: "$15-18/hr",
      logo: "/placeholder.svg", // Using local placeholder instead of via.placeholder.com
      posted: "2 days ago",
    },
    {
      id: 2,
      title: "Campus Ambassador",
      company: "Spotify",
      location: "Remote",
      type: "Flexible",
      salary: "$17/hr",
      logo: "/placeholder.svg", // Using local placeholder instead of via.placeholder.com
      posted: "1 day ago",
    },
    {
      id: 3,
      title: "Junior Web Developer",
      company: "TechStart",
      location: "Boston, MA",
      type: "Internship",
      salary: "$20-25/hr",
      logo: "/placeholder.svg", // Using local placeholder instead of via.placeholder.com
      posted: "3 days ago",
    },
    {
      id: 4,
      title: "Barista",
      company: "Local Coffee Shop",
      location: "Chicago, IL",
      type: "Part-time",
      salary: "$14/hr + tips",
      logo: "/placeholder.svg", // Using local placeholder instead of via.placeholder.com
      posted: "Just now",
    },
    {
      id: 5,
      title: "Research Assistant",
      company: "University Lab",
      location: "Austin, TX",
      type: "Part-time",
      salary: "$16-20/hr",
      logo: "/placeholder.svg", // Using local placeholder instead of via.placeholder.com
      posted: "5 days ago",
    },
    {
      id: 6,
      title: "Social Media Intern",
      company: "Creative Agency",
      location: "Remote",
      type: "Internship",
      salary: "$15/hr",
      logo: "/placeholder.svg", // Using local placeholder instead of via.placeholder.com
      posted: "1 week ago",
    },
  ]

  return (
    <section className="jobs-section">
      <div className="container">
        <div className="section-header animate-on-scroll fade-in">
          <h2 className="section-title">Featured Student Jobs</h2>
          <p className="section-subtitle">Discover the latest opportunities perfect for your schedule</p>
        </div>
        <div className="jobs-grid">
          {jobs.map((job, index) => (
            <a
              key={job.id}
              href="#"
              className="job-card animate-on-scroll slide-up"
              style={{ animationDelay: `${0.1 * index}s` }}
            >
              <div className="job-card-header">
                <div className="job-info">
                  <img src={job.logo || "/placeholder.svg"} alt={job.company} className="company-logo" />
                  <div>
                    <h3 className="job-title">{job.title}</h3>
                    <p className="company-name">{job.company}</p>
                  </div>
                </div>
                <span className="job-type">{job.type}</span>
              </div>
              <div className="job-details">
                <div className="job-detail">
                  <MapPin className="detail-icon" />
                  <span>{job.location}</span>
                </div>
                <div className="job-detail">
                  <DollarSign className="detail-icon" />
                  <span>{job.salary}</span>
                </div>
                <div className="job-detail">
                  <Clock className="detail-icon" />
                  <span>{job.posted}</span>
                </div>
              </div>
              <button className="apply-btn">Apply Now</button>
            </a>
          ))}
        </div>
        <div className="view-all animate-on-scroll fade-in">
          <button className="btn btn-outline">View All Jobs</button>
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  // Component code remains the same
  const steps = [
    {
      icon: <Search className="step-icon" />,
      title: "Search Jobs",
      description: "Browse through thousands of student-friendly job opportunities across various industries.",
    },
    {
      icon: <FileText className="step-icon" />,
      title: "Create Profile",
      description:
        "Build your profile highlighting your skills, experience, and availability to stand out to employers.",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="step-icon"
        >
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
          <path d="M9 22v-4h6v4"></path>
          <path d="M8 6h.01"></path>
          <path d="M16 6h.01"></path>
          <path d="M12 6h.01"></path>
          <path d="M12 10h.01"></path>
          <path d="M12 14h.01"></path>
          <path d="M16 10h.01"></path>
          <path d="M16 14h.01"></path>
          <path d="M8 10h.01"></path>
          <path d="M8 14h.01"></path>
        </svg>
      ),
      title: "Apply with Ease",
      description: "Apply to multiple jobs with just a few clicks using your saved profile information.",
    },
    {
      icon: <CheckCircle className="step-icon" />,
      title: "Get Hired",
      description: "Connect with employers, schedule interviews, and land your perfect student job.",
    },
  ]

  return (
    <section className="how-it-works-section">
      <div className="container">
        <div className="section-header animate-on-scroll fade-in">
          <h2 className="section-title">How Jobify Works</h2>
          <p className="section-subtitle">Your journey to finding the perfect student job is just a few steps away</p>
        </div>
        <div className="steps-container">
          {steps.map((step, index) => (
            <div
              key={index}
              className="step-card animate-on-scroll slide-up"
              style={{ animationDelay: `${0.2 * index}s` }}
            >
              <div className="step-icon-container">{step.icon}</div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Testimonials() {
  const testimonials = [
    {
      quote:
        "Jobify helped me find a flexible retail position that works perfectly with my class schedule. The application process was so simple!",
      name: "Alex Johnson",
      role: "Marketing Student",
      avatar: "/placeholder.svg", // Replaced via.placeholder.com with local placeholder
    },
    {
      quote:
        "As a computer science major, I found an amazing internship through Jobify that gave me real-world experience while still in school.",
      name: "Samantha Lee",
      role: "Computer Science Student",
      avatar: "/placeholder.svg", // Replaced via.placeholder.com with local placeholder
    },
    {
      quote:
        "I was struggling to find work that would accommodate my busy schedule until I discovered Jobify. Now I have a great campus job!",
      name: "Marcus Williams",
      role: "Business Administration Student",
      avatar: "/placeholder.svg", // Replaced via.placeholder.com with local placeholder
    },
  ]

  return (
    <section className="testimonials-section">
      <div className="container">
        <div className="section-header animate-on-scroll fade-in">
          <h2 className="section-title">Student Success Stories</h2>
          <p className="section-subtitle">Hear from students who found their perfect job match through Jobify</p>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="testimonial-card animate-on-scroll slide-up"
              style={{ animationDelay: `${0.15 * index}s` }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="quote-icon"
              >
                <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
                <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path>
              </svg>
              <p className="testimonial-quote">{testimonial.quote}</p>
              <div className="testimonial-author">
                <img src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} className="author-avatar" />
                <div className="author-info">
                  <h4 className="author-name">{testimonial.name}</h4>
                  <p className="author-role">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
