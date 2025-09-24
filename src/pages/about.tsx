import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Brain, Heart, Shield, Zap, Globe, Users, Stethoscope, Bot, Camera, Activity } from "lucide-react";
import { useLocation } from "wouter";

export default function About() {
  const [, setLocation] = useLocation();

  const keyFocusAreas = [
    {
      id: 1,
      icon: <Brain className="w-8 h-8 text-naija-green" />,
      title: "AI-Powered Diagnostics",
      description: "Leveraging AI to analyze patient symptoms and medical history for faster and more accurate diagnosis.",
      color: "bg-green-50 border-green-200"
    },
    {
      id: 2,
      icon: <Stethoscope className="w-8 h-8 text-blue-600" />,
      title: "Digitization of Test Kits",
      description: "Developing AI-integrated test kits that provide real-time results and insights via mobile devices.",
      color: "bg-blue-50 border-blue-200"
    },
    {
      id: 3,
      icon: <Activity className="w-8 h-8 text-purple-600" />,
      title: "Patient Healthcare Visualization & Analysis",
      description: "Using AI-driven dashboards to track patient health trends, flag anomalies, and provide predictive health insights.",
      color: "bg-purple-50 border-purple-200"
    },
    {
      id: 4,
      icon: <Shield className="w-8 h-8 text-orange-600" />,
      title: "AI-Assisted Prescription & Precision Drone Delivery",
      description: "An AI-powered prescription system that cross-checks patient history, drug interactions, and best treatment options.",
      color: "bg-orange-50 border-orange-200"
    },
    {
      id: 5,
      icon: <Heart className="w-8 h-8 text-red-600" />,
      title: "Remote AI-Driven Monitoring",
      description: "Wearable integrations that monitor vitals in real-time and alert patients or doctors when intervention is needed.",
      color: "bg-red-50 border-red-200"
    },
    {
      id: 6,
      icon: <Bot className="w-8 h-8 text-indigo-600" />,
      title: "Personalized AI Health Coaching",
      description: "AI chatbots or virtual assistants offering tailored healthcare advice and medication reminders.",
      color: "bg-indigo-50 border-indigo-200"
    },
    {
      id: 7,
      icon: <Zap className="w-8 h-8 text-yellow-600" />,
      title: "AI-Powered Preventive Care",
      description: "Predictive AI models that identify potential health risks based on lifestyle, genetics, and environmental factors.",
      color: "bg-yellow-50 border-yellow-200"
    },
    {
      id: 8,
      icon: <Camera className="w-8 h-8 text-teal-600" />,
      title: "AI for Medical Imaging Analysis",
      description: "AI-powered tools for analyzing X-rays, MRIs, and CT scans for faster and more accurate diagnosis.",
      color: "bg-teal-50 border-teal-200"
    },
    {
      id: 9,
      icon: <Users className="w-8 h-8 text-pink-600" />,
      title: "AI Chatbots for 24/7 Patient Support",
      description: "An AI-driven support system that provides instant responses to health-related questions and concerns.",
      color: "bg-pink-50 border-pink-200"
    },
    {
      id: 10,
      icon: <Bot className="w-8 h-8 text-emerald-600" />,
      title: "AI Consultation",
      description: "Real-time AI-powered health consultations providing immediate medical guidance and symptom analysis.",
      color: "bg-emerald-50 border-emerald-200"
    },
    {
      id: 11,
      icon: <Heart className="w-8 h-8 text-rose-600" />,
      title: "Personalized Healthcare",
      description: "Customized health plans and recommendations based on individual medical history, lifestyle, and preferences.",
      color: "bg-rose-50 border-rose-200"
    },
    {
      id: 12,
      icon: <Shield className="w-8 h-8 text-amber-600" />,
      title: "Elders Care Service",
      description: "Specialized healthcare support and monitoring services designed specifically for elderly patients and their families.",
      color: "bg-amber-50 border-amber-200"
    },
    {
      id: 13,
      icon: <Activity className="w-8 h-8 text-cyan-600" />,
      title: "Fitness and Wellness",
      description: "Comprehensive fitness tracking, workout plans, and wellness coaching integrated with health monitoring.",
      color: "bg-cyan-50 border-cyan-200"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation('/')}
          className="p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">About Presibo</h1>
          <p className="text-gray-600">Revolutionizing Healthcare with AI</p>
        </div>
      </div>

      {/* Hero Section */}
      <Card className="mb-8 bg-gradient-to-r from-naija-green to-green-600 border-0">
        <CardContent className="p-8">
          <div className="text-center">
            <Globe className="w-16 h-16 mx-auto mb-4 text-white" />
            <h2 className="text-3xl font-bold mb-4 text-black">
              AI-Powered Healthcare Revolution
            </h2>
            <p className="text-lg leading-relaxed max-w-3xl mx-auto text-black">
              Presibo is giving you access to fast, affordable, stress free and smart healthcare. 
              We streamline consultations, accelerate diagnosis, food optimization and digitize patient records, 
              making healthcare smarter, faster, and more accessible for all Nigerians.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Company Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-naija-green" />
            About Presibo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            Presibo is a digital medical service that is helping patients get fast, smart, stress-free, affordable and quality medical care by leveraging on Artificial Intelligence. Presibo uses AI and machine learning technology to bridge the gaps in Africa's health sector.
          </p>
        </CardContent>
      </Card>

      {/* Mission Statement */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-naija-green" />
            Our Mission
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-gray-700 leading-relaxed">
            For Presibo AI innovation, our products are curated for improving healthcare in Africa. 
            We are committed to making advanced healthcare technology accessible to every Nigerian, 
            bridging the gap between cutting-edge medical innovation and local healthcare needs.
          </p>
        </CardContent>
      </Card>

      {/* Key Focus Areas */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Our Key Focus Areas
        </h2>
        
        <div className="grid gap-6">
          {keyFocusAreas.map((area) => (
            <Card key={area.id} className={`${area.color} hover:shadow-lg transition-shadow`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {area.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {area.title}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {area.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Technology Stack */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-naija-green" />
            Our Technology
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Badge variant="secondary" className="p-3 text-center">
              Anthropic Claude AI
            </Badge>
            <Badge variant="secondary" className="p-3 text-center">
              Machine Learning
            </Badge>
            <Badge variant="secondary" className="p-3 text-center">
              Computer Vision
            </Badge>
            <Badge variant="secondary" className="p-3 text-center">
              Natural Language Processing
            </Badge>
            <Badge variant="secondary" className="p-3 text-center">
              Predictive Analytics
            </Badge>
            <Badge variant="secondary" className="p-3 text-center">
              Real-time Monitoring
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Impact Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-naija-green" />
            Our Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-naija-green mb-2">24/7</div>
              <p className="text-gray-600">AI Health Support</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-naija-green mb-2">100%</div>
              <p className="text-gray-600">Digital Health Records</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-naija-green mb-2">∞</div>
              <p className="text-gray-600">Scalable Healthcare Access</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-6 h-6 text-naija-green" />
            Get in Touch
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-gray-700">
              Ready to experience the future of healthcare? Join thousands of Nigerians 
              who trust Presibo for their health and wellness needs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => setLocation('/subscribe')}
                className="bg-naija-green hover:bg-naija-green/90"
              >
                Get Started Today
              </Button>
              <Button 
                variant="outline"
                onClick={() => setLocation('/team')}
              >
                Meet Our Team
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.open('tel:+2347032810862', '_self')}
              >
                Contact Support
              </Button>
            </div>
            
            <p className="text-sm text-gray-600">
              Call us: <a href="tel:+2347032810862" className="text-naija-green font-medium">+234 703 281 0862</a>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <Card className="bg-gray-900 text-white">
        <CardContent className="p-6 text-center">
          <p className="text-gray-300 mb-2">
            © 2025 Presibo. All rights reserved.
          </p>
          <p className="text-sm text-gray-400">
            Making healthcare smarter, faster, and more affordable for all Nigerians.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}