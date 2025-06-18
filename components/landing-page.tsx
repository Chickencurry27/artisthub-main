"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Building2, Users, FolderOpen, Music, CheckCircle, Star, ArrowRight } from "lucide-react"

export function LandingPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { login, register } = useAuth()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const success = await login(email, password)

    if (!success) {
      toast({
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const name = formData.get("name") as string

    if (password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    const success = await register(email, password, name)

    if (!success) {
      toast({
        title: "Registration Failed",
        description: "An account with this email already exists.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Welcome!",
        description: "Your account has been created successfully.",
      })
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">ClientHub</span>
          </div>
          <div className="text-sm text-gray-600">Professional Project Management</div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Section */}
          <div className="space-y-8 pt-8 md:pt-12">
            <div className="space-y-6 text-center md:text-left">
              <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 leading-tight">
                Manage Your
                <span className="block text-blue-600 drop-shadow-md">Clients & Projects</span>
                Like a Pro
              </h1>
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-2xl mx-auto md:mx-0">
                Streamline your workflow with our comprehensive client and project management platform. Track projects,
                manage songs, and collaborate with clients seamlessly. Built for creative professionals who demand efficiency and elegance.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-0.5">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="font-semibold px-8 py-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ease-in-out border-gray-300 hover:border-gray-400">
                  Learn More
                </Button>
              </div>
            </div>

            {/* Features */}
            <div id="features" className="pt-6 scroll-mt-20">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center md:text-left">Key Features:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Client Management</h4>
                    <p className="text-sm text-gray-600">Keep all client details organized.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="p-3 bg-green-100 rounded-full">
                    <FolderOpen className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Project Tracking</h4>
                    <p className="text-sm text-gray-600">Monitor project progress with ease.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Music className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Song Versioning</h4>
                    <p className="text-sm text-gray-600">Manage multiple song revisions.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="p-3 bg-orange-100 rounded-full">
                    <CheckCircle className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Progress Tracking</h4>
                    <p className="text-sm text-gray-600">Visualize task completion.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonials Section */}
            <div id="testimonials" className="mt-12 pt-10 border-t border-gray-200 scroll-mt-20">
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8 text-center md:text-left">
                What Our Users Say
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                {[
                  {
                    quote:
                      "ClientHub transformed how I manage my music production projects. Everything is organized and my clients love the transparency. It's a game-changer!",
                    author: "Sarah M.",
                    title: "Music Producer",
                    stars: 5,
                  },
                  {
                    quote:
                      "Finally, a project management tool that understands the creative workflow! The song versioning feature is a lifesaver. Highly recommended for any studio.",
                    author: "Alex P.",
                    title: "Sound Engineer",
                    stars: 5,
                  },
                  {
                    quote:
                      "As a freelance designer, ClientHub helps me keep track of all client communication and project milestones. It's made my billing process so much smoother.",
                    author: "Jessica B.",
                    title: "Graphic Designer",
                    stars: 4,
                  },
                ].map((testimonial, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-xl shadow-xl text-white relative overflow-hidden h-full flex flex-col"
                  >
                    <div className="absolute -top-3 -left-3 w-20 h-20 bg-white/10 rounded-full opacity-40"></div>
                    <div className="absolute -bottom-5 -right-2 w-28 h-28 bg-white/10 rounded-tr-full opacity-40"></div>
                    <div className="relative z-10 flex flex-col flex-grow">
                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(testimonial.stars)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-300" />
                        ))}
                        {[...Array(5 - testimonial.stars)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 fill-gray-300/70 text-gray-200/60" />
                        ))}
                      </div>
                      <blockquote className="text-base italic leading-relaxed flex-grow">
                        "{testimonial.quote}"
                      </blockquote>
                      <p className="text-sm font-semibold mt-4">
                        - {testimonial.author}, <span className="font-normal">{testimonial.title}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Auth Forms */}
          <div className="lg:pl-8">
            <Card className="w-full max-w-md mx-auto shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Get Started Today</CardTitle>
                <CardDescription>
                  Join thousands of professionals managing their projects with ClientHub
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="register" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="register">Sign Up</TabsTrigger>
                    <TabsTrigger value="login">Sign In</TabsTrigger>
                  </TabsList>

                  <TabsContent value="register" className="space-y-4">
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-name">Company Name</Label>
                        <Input id="register-name" name="name" placeholder="Enter your company name" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-email">Email</Label>
                        <Input id="register-email" name="email" type="email" placeholder="Enter your email" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-password">Password</Label>
                        <Input
                          id="register-password"
                          name="password"
                          type="password"
                          placeholder="Create a password (min. 6 characters)"
                          required
                          minLength={6}
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Creating Account..." : "Create Account"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="login" className="space-y-4">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <Input id="login-email" name="email" type="email" placeholder="Enter your email" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Password</Label>
                        <Input
                          id="login-password"
                          name="password"
                          type="password"
                          placeholder="Enter your password"
                          required
                        />
                        <div className="text-right">
                          <a href="/forgot-password" className="text-xs text-blue-600 hover:underline">
                            Forgot Password?
                          </a>
                        </div>
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Signing In..." : "Sign In"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Demo Account */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Want to try it out? Use demo account:
                <br />
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">demo@clienthub.com / demo123</code>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* About Us Section */}
      <section id="about-us" className="py-16 lg:py-24 bg-white scroll-mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              About ClientHub
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              ClientHub was born from a simple idea: to empower creative professionals and agencies with a project management tool that's both powerful and intuitive. We understand the unique challenges of managing diverse clients, intricate projects, and tight deadlines. Our mission is to streamline your workflow, foster seamless collaboration, and help you deliver outstanding results, every time.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold text-blue-600 mb-3">Our Mission</h3>
              <p className="text-gray-600">
                To provide an elegant, efficient, and user-centric platform that simplifies project and client management for creative individuals and teams, enabling them to focus on what they do best: creating.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold text-green-600 mb-3">Our Vision</h3>
              <p className="text-gray-600">
                To be the leading project management solution for the creative industry, recognized for our commitment to innovation, customer success, and fostering a community of thriving professionals.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow md:col-span-2 lg:col-span-1">
              <h3 className="text-xl font-semibold text-purple-600 mb-3">Our Values</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Customer-Centricity: Your success is our priority.</li>
                <li>Simplicity: Powerful features, easy to use.</li>
                <li>Innovation: Continuously evolving to meet your needs.</li>
                <li>Integrity: Transparent and ethical in all we do.</li>
                <li>Collaboration: Building a supportive community.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 lg:py-24 bg-gradient-to-br from-blue-50 to-indigo-100 scroll-mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Flexible Pricing for Teams of All Sizes
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Choose the plan that best fits your needs and budget. All plans come with a 14-day free trial.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-stretch">
            {[
              {
                name: "Basic",
                price: "$29",
                priceSuffix: "/ month",
                description: "For individuals and small teams getting started.",
                features: [
                  "Up to 5 Projects",
                  "Basic Client Management",
                  "Standard Reporting",
                  "Email Support",
                  "1GB Storage",
                ],
                cta: "Choose Basic",
                isPopular: false,
              },
              {
                name: "Pro",
                price: "$59",
                priceSuffix: "/ month",
                description: "For growing teams needing more power and collaboration.",
                features: [
                  "Up to 25 Projects",
                  "Advanced Client Management",
                  "Custom Reporting",
                  "Priority Email Support",
                  "10GB Storage",
                  "Team Collaboration Tools",
                ],
                cta: "Choose Pro",
                isPopular: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                priceSuffix: "",
                description: "For large organizations with specific needs.",
                features: [
                  "Unlimited Projects",
                  "Dedicated Account Manager",
                  "API Access & Integrations",
                  "24/7 Phone Support",
                  "Unlimited Storage",
                  "Custom Onboarding",
                ],
                cta: "Contact Us",
                isPopular: false,
              },
            ].map((plan, index) => (
              <div
                key={index}
                className={`bg-white rounded-xl shadow-lg p-8 flex flex-col ${
                  plan.isPopular ? "border-4 border-blue-500 relative" : "border border-gray-200"
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white text-xs font-semibold px-4 py-1 rounded-full shadow-md">
                    MOST POPULAR
                  </div>
                )}
                <div className="flex-grow">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                    {plan.priceSuffix && (
                      <span className="text-lg text-gray-500 ml-1">{plan.priceSuffix}</span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-6 min-h-[60px]">{plan.description}</p>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  size="lg"
                  className={`w-full font-semibold py-3 ${
                    plan.isPopular
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-blue-600"
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-900 text-gray-400 mt-16">
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-sm">&copy; 2024 ClientHub. All rights reserved.</p>
              <p className="text-xs">Built for creative professionals.</p>
            </div>
            <nav className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2">
              <a href="#features" className="text-sm hover:text-blue-400 transition-colors">Features</a>
              <a href="#testimonials" className="text-sm hover:text-blue-400 transition-colors">Testimonials</a>
              <a href="#about-us" className="text-sm hover:text-blue-400 transition-colors">About Us</a>
              <a href="#pricing" className="text-sm hover:text-blue-400 transition-colors">Pricing</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}
