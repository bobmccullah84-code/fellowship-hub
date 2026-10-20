import { Card, CardContent } from "@/components/ui/card";
import { useSettings } from "@/contexts/SettingsContext";
import { 
  BookOpen, 
  Video, 
  Mic, 
  MessageCircle, 
  GraduationCap, 
  Heart,
  CheckCircle,
  Lock
} from "lucide-react";

// Static class mappings for Tailwind (required for build-time detection)
const getSectionTitleClasses = (size?: string) => {
  switch (size) {
    case 'sm': return 'text-sm lg:text-base';
    case 'base': return 'text-base lg:text-lg';
    case 'lg': return 'text-lg lg:text-xl';
    case 'xl': return 'text-xl lg:text-2xl';
    case '2xl': return 'text-2xl lg:text-3xl';
    case '3xl': return 'text-3xl lg:text-4xl';
    case '4xl': return 'text-4xl lg:text-5xl';
    case '5xl': return 'text-5xl lg:text-6xl';
    case '6xl': return 'text-6xl lg:text-7xl';
    default: return 'text-3xl lg:text-4xl';
  }
};

export default function FeaturesGrid() {
  const { settings } = useSettings();
  const features = [
    {
      icon: BookOpen,
      title: "Rich Teaching Content",
      description: "Access hundreds of sermons, Bible studies, and theological resources from trusted Christian teachers and pastors.",
      isPublic: true,
    },
    {
      icon: Video,
      title: "Video & Audio",
      description: "Watch sermons, listen to podcasts, and access our complete media library with high-quality streaming.",
      isPublic: true,
    },
    {
      icon: Mic,
      title: "Voice Fellowship",
      description: "Join live prayer sessions, Bible studies, and fellowship discussions in real-time voice channels.",
      isPublic: false,
    },
    {
      icon: MessageCircle,
      title: "Community Chat",
      description: "Connect with believers worldwide through text channels, private messages, and group discussions.",
      isPublic: false,
    },
    {
      icon: GraduationCap,
      title: "Discipleship Courses",
      description: "Structured learning paths for spiritual growth, from basic faith principles to advanced theological studies.",
      isPublic: true,
    },
    {
      icon: Heart,
      title: "Prayer Support",
      description: "Share prayer requests and pray for others in our supportive community of believers.",
      isPublic: false,
    },
  ];

  return (
    <section className="py-16 bg-gray-100 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className={`${getSectionTitleClasses(settings?.typography?.sectionTitleSize)} font-bold text-gray-900 dark:text-gray-100 mb-4`}>
            {settings?.featuresTitle || "Resources for Spiritual Growth"}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {settings?.featuresSubtitle || "Everything you need to grow in your faith"}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="card-hover shadow-sm hover:shadow-lg transition-all duration-200"
              >
                <CardContent className="p-8">
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                    <Icon className="text-primary text-xl h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {feature.description}
                  </p>
                  <div className="flex items-center text-sm">
                    {feature.isPublic ? (
                      <>
                        <CheckCircle className="text-accent mr-2 h-4 w-4" />
                        <span className="text-gray-600 dark:text-gray-300">No registration required</span>
                      </>
                    ) : (
                      <>
                        <Lock className="text-gray-600 dark:text-gray-300 mr-2 h-4 w-4" />
                        <span className="text-gray-600 dark:text-gray-300">Requires registration</span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
