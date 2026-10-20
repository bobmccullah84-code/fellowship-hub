import { useLocation } from "wouter";
import { Cross, BookOpen, Droplet, Heart, Shield, HeartCrack, HeartHandshake, Church } from "lucide-react";

interface OutlineCategory {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  textColor: string;
  iconBg: string;
  route: string;
}

export default function FoundationsOutlinePage() {
  const [, setLocation] = useLocation();

  const categories: OutlineCategory[] = [
    {
      number: "01",
      title: "CHRIST",
      subtitle: "Lecture for untrustworthy peers",
      description: "Discerned fervor & evolution",
      icon: Cross,
      color: "bg-gradient-to-br from-amber-400 to-orange-500",
      bgColor: "bg-white dark:bg-gray-800",
      textColor: "text-orange-500",
      iconBg: "text-orange-500",
      route: "/teachings?category=christ"
    },
    {
      number: "02",
      title: "SCRIPTURE",
      subtitle: "Rhetoric the far Gicinuous",
      description: "Donat inspirer of fundamental phrase",
      icon: BookOpen,
      color: "bg-gradient-to-br from-green-400 to-green-600",
      bgColor: "bg-white dark:bg-gray-800",
      textColor: "text-green-600",
      iconBg: "text-green-600",
      route: "/teachings?category=scripture"
    },
    {
      number: "03",
      title: "BAPTISM",
      subtitle: "Aqctr mering fure",
      description: "Donat learn are are e realization",
      icon: Droplet,
      color: "bg-gradient-to-br from-green-500 to-teal-500",
      bgColor: "bg-white dark:bg-gray-800",
      textColor: "text-green-600",
      iconBg: "text-green-600",
      route: "/teachings?category=baptism"
    },
    {
      number: "04",
      title: "PRAYER",
      subtitle: "Creqci famze on Tiillah",
      description: "inscrie mance or llien ently",
      icon: Heart,
      color: "bg-gradient-to-br from-cyan-400 to-cyan-600",
      bgColor: "bg-white dark:bg-gray-800",
      textColor: "text-cyan-600",
      iconBg: "text-cyan-600",
      route: "/teachings?category=prayer"
    },
    {
      number: "05",
      title: "OVERCOMING",
      subtitle: "Dcesothaiuer or tMElieces",
      description: "Sasse diqplci reimasasher josido",
      icon: Shield,
      color: "bg-gradient-to-br from-blue-500 to-blue-700",
      bgColor: "bg-white dark:bg-gray-800",
      textColor: "text-blue-600",
      iconBg: "text-blue-600",
      route: "/teachings?category=overcoming"
    },
    {
      number: "06",
      title: "SIN",
      subtitle: "More evaluative",
      description: "Donat Dlastion mdratino",
      icon: HeartCrack,
      color: "bg-gradient-to-br from-purple-500 to-purple-700",
      bgColor: "bg-white dark:bg-gray-800",
      textColor: "text-purple-600",
      iconBg: "text-purple-600",
      route: "/teachings?category=sin"
    },
    {
      number: "07",
      title: "FAITH",
      subtitle: "Cirtelyghere lorerther tars ccm",
      description: "Gua e najar of te oliere",
      icon: HeartHandshake,
      color: "bg-gradient-to-br from-pink-500 to-pink-700",
      bgColor: "bg-white dark:bg-gray-800",
      textColor: "text-pink-600",
      iconBg: "text-pink-600",
      route: "/teachings?category=faith"
    },
    {
      number: "08",
      title: "HOLY LIVING",
      subtitle: "Walking in righteousness",
      description: "Daily practices for godly living",
      icon: Church,
      color: "bg-gradient-to-br from-red-500 to-red-700",
      bgColor: "bg-white dark:bg-gray-800",
      textColor: "text-red-600",
      iconBg: "text-red-600",
      route: "/teachings?category=holy-living"
    }
  ];

  const handleCardClick = (route: string) => {
    setLocation(route);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4" data-testid="text-page-title">
            Foundations of Faith
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300" data-testid="text-page-subtitle">
            Essential teachings for spiritual growth
          </p>
        </div>

        <div className="space-y-4">
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <button
                key={index}
                onClick={() => handleCardClick(category.route)}
                className="w-full group transition-all duration-200 hover:scale-[1.02]"
                data-testid={`card-category-${category.title.toLowerCase()}`}
              >
                <div className={`${category.bgColor} rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200 flex items-center overflow-hidden`}>
                  {/* Number Section */}
                  <div className={`${category.color} flex-shrink-0 w-32 h-24 flex items-center justify-center`}>
                    <span className="text-4xl font-bold text-white" data-testid={`text-number-${category.title.toLowerCase()}`}>
                      {category.number}
                    </span>
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 px-6 py-4 text-left">
                    <h3 className={`text-2xl font-bold ${category.textColor} mb-1`} data-testid={`text-title-${category.title.toLowerCase()}`}>
                      {category.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400" data-testid={`text-subtitle-${category.title.toLowerCase()}`}>
                      {category.subtitle}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1" data-testid={`text-description-${category.title.toLowerCase()}`}>
                      {category.description}
                    </p>
                  </div>

                  {/* Icon Section */}
                  <div className="flex-shrink-0 pr-8">
                    <IconComponent 
                      className={`w-12 h-12 ${category.iconBg} opacity-80`} 
                      strokeWidth={1.5}
                      data-testid={`icon-${category.title.toLowerCase()}`}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => setLocation("/")}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            data-testid="button-back-home"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
