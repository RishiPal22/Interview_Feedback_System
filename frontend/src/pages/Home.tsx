import { Card, CardDescription, CardHeader, CardTitle } from "../Components/ui/card"
import { CheckCircle, MessageSquare, Zap } from "lucide-react"
// import Navbar from "../Components/Navbar" // Import the Navbar component

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      {/* Use the Navbar component instead of the previous header */}
      {/* <Navbar /> */}

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="flex flex-col justify-center space-y-4">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              Elevate Your <span className="text-purple-500">Interview Process</span>
            </h1>
            <p className="text-muted-foreground text-gray-400 md:text-xl">
              Streamline your interview feedback collection and analysis with our AI-powered platform. Get deeper
              insights and make better hiring decisions.
            </p>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative h-[350px] w-full max-w-[500px] overflow-hidden rounded-lg border border-purple-800 bg-gradient-to-br from-purple-900/40 to-black shadow-xl">
              {/* Replaced Image component with img tag */}
              <img src="/placeholder.svg" alt="Interview Dashboard Preview" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Audio Component Integration */}
      <section className="container mx-auto px-4 py-8 md:px-6 bg-purple-900/20 rounded-xl my-8">
        <div className="flex flex-col items-center text-center mb-8">
          <h2 className="text-2xl font-bold mb-4">AI-Powered Audio Analysis</h2>
          <p className="text-gray-400 max-w-2xl">
            Experience our cutting-edge audio analysis technology that helps you extract valuable insights from
            interviews.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-16 md:py-24 md:px-6">
        <div className="flex flex-col items-center text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">Why Choose Us</h2>
          <p className="text-gray-400 max-w-[800px]">
            Our platform offers everything you need to transform your interview process and make data-driven hiring
            decisions.
          </p>
        </div>
        <div className="grid gap-6 flex flex-row">
          
          <Card className="bg-black border-purple-800  justify-center">
            <CardHeader>
              <Zap className="h-8 w-8 text-purple-500 mb-2" />
              <CardTitle className="text-purple-500">AI-Powered Analysis</CardTitle>
              <CardDescription className="text-gray-400">
                Leverage advanced AI to analyze interview responses and identify key insights.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-black border-purple-800 flex justify-center">
            <CardHeader>
              <CheckCircle className="h-8 w-8 text-purple-500 mb-2" />
              <CardTitle className="text-purple-500">Standardized Evaluation</CardTitle>
              <CardDescription className="text-gray-400">
                Create consistent evaluation criteria to ensure fair assessment of all candidates.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="container mx-auto px-4 py-16 md:py-24 md:px-6 bg-gradient-to-b from-black to-purple-950/30"
      >
        <div className="flex flex-col items-center text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">How It Works</h2>
          <p className="text-gray-400 max-w-[800px]">
            Get started in minutes and transform your interview process with these simple steps.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-900 mb-4">
              <span className="text-xl font-bold">1</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Real-Time Vision</h3>
            <p className="text-gray-400">
            Instantly preview your camera feed with seamless live streaming and crisp visuals.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-900 mb-4">
              <span className="text-xl font-bold">2</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Start Your Interview</h3>
            <p className="text-gray-400">Begin your interview session with real-time recording and seamless interaction.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-900 mb-4">
              <span className="text-xl font-bold">3</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Analyze Results</h3>
            <p className="text-gray-400">Review comprehensive analytics and make informed hiring decisions.</p>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="border-t border-purple-900/50 bg-black">
        <div className="container mx-auto px-4 py-8 md:px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-6 w-6 text-purple-500" />
                <span className="text-xl font-bold">InterviewPro</span>
              </div>
              <p className="text-gray-400 mb-4">
                Transforming the way companies conduct interviews and make hiring decisions.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                    Integrations
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                    Case Studies
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                    Community
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-purple-900/50 mt-8 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} InterviewPro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

