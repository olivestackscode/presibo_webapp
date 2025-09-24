import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Mail, Phone, Linkedin, Github } from "lucide-react";
import { useLocation } from "wouter";
import ceoImage from "@assets/ceo_1751149240872.png";
import cmoImage from "@assets/cmo_1751149283425.jpg";
import cooImage from "@assets/coo_1751149318234.png";
import ctoImage from "@assets/cto_1751149403844.png";
import cdoImage from "@assets/cdo_1751149594663.png";

export default function Team() {
  const [, setLocation] = useLocation();

  const teamMembers = [
    {
      id: 1,
      name: "Jerry Nwobodo",
      role: "CEO & Lead Engineer",
      description: "A seasoned Software Engineer and Product Designer with expertise in AI integration, cloud infrastructure, and user-centered digital health platforms. He leads the technical development and architecture of Presibo.",
      image: ceoImage,
      skills: ["AI Integration", "Cloud Infrastructure", "Product Design", "Healthcare Platforms", "Full-Stack Development"],
      color: "from-naija-green to-green-600"
    },
    {
      id: 2,
      name: "Dr. Derrick Udah",
      role: "Co-Founder & COO",
      description: "Co-Founder & COO, oversees daily operations, optimizing service delivery and patient experience with a focus on operational excellence and healthcare service optimization.",
      image: cooImage,
      skills: ["Operations Management", "Healthcare Operations", "Service Delivery", "Patient Experience", "Strategic Planning"],
      color: "from-blue-600 to-blue-700"
    },
    {
      id: 3,
      name: "Dr. Enny Aikodon",
      role: "Co-Founder & Chief Medical Officer",
      description: "A licensed physician with experience in clinical diagnostics and digital health workflows, ensuring medical accuracy and compliance in AI decision-making and EMR design.",
      image: cmoImage,
      skills: ["Clinical Diagnostics", "Digital Health", "Medical Compliance", "EMR Design", "AI Medical Validation"],
      color: "from-purple-600 to-purple-700"
    },
    {
      id: 4,
      name: "Seun Ayela",
      role: "Chief Technology Officer",
      description: "Our Chief Technology Officer is a DevOps & Infrastructure Engineer skilled in deploying scalable applications using AWS, Docker, and CI/CD pipelines, enabling reliable performance and security.",
      image: ctoImage,
      skills: ["DevOps Engineering", "AWS Infrastructure", "Docker", "CI/CD Pipelines", "System Security", "LLM Fine-tuning"],
      color: "from-orange-600 to-orange-700"
    },
    {
      id: 5,
      name: "Dr. Sukke Ekpeyong",
      role: "Chief Compliance Officer",
      description: "Experienced Medical Doctor and Chief Compliance Officer of Presibo. He oversees regulatory compliance, ensuring all technology innovations align with healthcare ethical standards, while driving technology solutions to enhance patient care.",
      image: cdoImage,
      skills: ["Regulatory Compliance", "Healthcare Ethics", "Technology Innovation", "Patient Care Enhancement", "Medical Standards"],
      color: "from-teal-600 to-teal-700"
    }
  ];

  const technicalCapabilities = [
    "AI Integration & Model Training",
    "Cloud Infrastructure (AWS)",
    "Scalable Application Deployment",
    "Docker Containerization",
    "CI/CD Pipeline Implementation",
    "Healthcare Compliance Systems",
    "Electronic Medical Records (EMR)",
    "LLM Fine-tuning for Nigerian Healthcare",
    "Real-time Monitoring Systems",
    "Mobile-First Development"
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation('/about')}
          className="p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Our Team</h1>
          <p className="text-gray-600">Meet the experts behind Presibo</p>
        </div>
      </div>

      {/* Team Introduction */}
      <Card className="mb-8 bg-gradient-to-r from-naija-green to-green-600 text-white border-0">
        <CardContent className="p-8">
          <div className="text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-black" />
            <h2 className="text-3xl font-bold mb-4 text-black">
              Strong Technical Leadership
            </h2>
            <p className="text-lg leading-relaxed max-w-4xl mx-auto text-black">
              Our team has strong technical capacity to build, scale and deploy Presibo's 
              AI-powered healthcare solution. We combine deep medical expertise with 
              cutting-edge technology to revolutionize healthcare in Nigeria.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      <div className="space-y-8 mb-8">
        {teamMembers.map((member) => (
          <Card key={member.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className={`h-2 bg-gradient-to-r ${member.color}`}></div>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Profile Image */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 mx-auto md:mx-0">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.style.display = 'none';
                        const nextElement = target.nextElementSibling as HTMLElement;
                        if (nextElement) nextElement.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full bg-gray-300 hidden items-center justify-center">
                      <Users className="w-12 h-12 text-gray-500" />
                    </div>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="flex-1">
                  <div className="text-center md:text-left">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {member.name}
                    </h3>
                    <div className={`inline-block px-4 py-2 rounded-full text-white font-semibold mb-4 bg-gradient-to-r ${member.color}`}>
                      {member.role}
                    </div>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {member.description}
                    </p>

                    {/* Skills */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Key Expertise:</h4>
                      <div className="flex flex-wrap gap-2">
                        {member.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Technical Capabilities */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="w-6 h-6 text-naija-green" />
            Technical Capabilities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-6">
            Our team's combined expertise enables us to deliver enterprise-grade healthcare solutions 
            with cutting-edge AI capabilities tailored specifically for the Nigerian healthcare landscape.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {technicalCapabilities.map((capability, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="w-2 h-2 bg-naija-green rounded-full"></div>
                <span className="text-gray-800 font-medium">{capability}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Collaboration & External Partnerships */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-6 h-6 text-naija-green" />
            External Collaborations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">
            We maintain strategic partnerships with external AI specialists for advanced model training 
            and LLM fine-tuning applications tailored specifically to the Nigerian healthcare context. 
            This collaborative approach ensures our solutions remain at the forefront of medical AI innovation 
            while maintaining cultural relevance and medical accuracy.
          </p>
        </CardContent>
      </Card>

      {/* Contact Team */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-6 h-6 text-naija-green" />
            Work With Our Team
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-gray-700">
              Interested in collaborating with our team or learning more about our technical approach? 
              We're always open to discussing partnerships and innovations in healthcare technology.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => setLocation('/subscribe')}
                className="bg-naija-green hover:bg-naija-green/90"
              >
                Join Our Platform
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.open('tel:+2347032810862', '_self')}
              >
                <Phone className="w-4 h-4 mr-2" />
                Contact Team
              </Button>
            </div>
            
            <p className="text-sm text-gray-600">
              Phone: <a href="tel:+2347032810862" className="text-naija-green font-medium">+234 703 281 0862</a>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <Card className="bg-gray-900 text-white">
        <CardContent className="p-6 text-center">
          <p className="text-gray-300 mb-2">
            Building the future of healthcare in Nigeria
          </p>
          <p className="text-sm text-gray-400">
            © 2025 Presibo Team. Dedicated to advancing healthcare through technology.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}