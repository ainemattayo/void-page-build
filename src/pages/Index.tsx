
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Users, Zap, Target, CheckCircle, Star, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">Tseer</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/onboarding">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 bg-blue-50 text-blue-700 border-blue-200">
            Connecting African Founders with Global Experts
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">Tseer</span> for Success
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Get personalized 1:1 advisory sessions with experienced entrepreneurs and industry experts. 
            Break through bottlenecks, accelerate growth, and build the next big thing from Africa.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/onboarding">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Apply as Founder
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/onboarding">
              <Button size="lg" variant="outline">
                Become a Tseer
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">100+</div>
            <div className="text-gray-600">Expert Tseers</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">500+</div>
            <div className="text-gray-600">Sessions Completed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">95%</div>
            <div className="text-gray-600">Satisfaction Rate</div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How Tseer Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>1. Apply & Match</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Tell us about your startup and challenges. We'll match you with the perfect Tseer based on expertise and experience.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>2. Get Guidance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Have 1:1 sessions with your Tseer. Get actionable advice, strategic insights, and practical solutions.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>3. Scale & Grow</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Implement strategies, track progress, and break through bottlenecks to achieve your startup goals.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* For Founders */}
        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">For African Founders</h2>
            <p className="text-gray-600 mb-6">
              Connect with experienced entrepreneurs who have built and scaled successful companies. 
              Get the guidance you need to overcome challenges and accelerate growth.
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>1:1 advisory sessions with matched experts</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Actionable strategies for your specific challenges</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Access to tools, templates, and resources</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Progress tracking and goal setting</span>
              </div>
            </div>
            <Link to="/onboarding">
              <Button size="lg">Apply as Founder</Button>
            </Link>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-green-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Success Stories</h3>
            <div className="space-y-4">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                </div>
                <p className="text-sm">"My Tseer helped me raise $2M Series A within 6 months of our sessions."</p>
                <p className="text-xs mt-2 opacity-80">- Sarah K., FinTech Founder</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                </div>
                <p className="text-sm">"Scaled from 10K to 100K users with strategic guidance from my advisor."</p>
                <p className="text-xs mt-2 opacity-80">- Michael A., E-commerce Founder</p>
              </div>
            </div>
          </div>
        </div>

        {/* For Advisors */}
        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Make an Impact</h3>
            <p className="mb-6">
              Share your expertise with the next generation of African entrepreneurs. 
              Help founders overcome challenges you've faced and make a lasting impact.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Globe className="h-5 w-5" />
                <span>Shape the future of African entrepreneurship</span>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5" />
                <span>Build meaningful mentoring relationships</span>
              </div>
              <div className="flex items-center space-x-3">
                <Target className="h-5 w-5" />
                <span>Flexible scheduling around your availability</span>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">For Experienced Advisors</h2>
            <p className="text-gray-600 mb-6">
              Join our community of successful entrepreneurs, industry experts, and thought leaders 
              who are passionate about nurturing the next generation of African innovators.
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Curated matching with relevant founders</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Recognition and badges for your contributions</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Access to exclusive Tseer community</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Showcase your expertise and build your brand</span>
              </div>
            </div>
            <Link to="/onboarding">
              <Button size="lg" variant="outline">Become a Tseer</Button>
            </Link>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-2xl p-12 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of founders who have accelerated their growth with personalized guidance from experienced Tseers.
          </p>
          <Link to="/onboarding">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
              Start Your Journey Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
