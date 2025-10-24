import { FaCheckCircle, FaArrowUp } from "react-icons/fa"
import { FaLocationPin, FaUserLarge } from "react-icons/fa6"

const achievements = [
    { 
        id: 1, 
        name: "Reported Issues", 
        number: "1.5M", 
        icon: <FaLocationPin className="text-white text-[2rem]" />,
        description: "Community reports processed",
        trend: "+12% this month"
    },
    { 
        id: 2, 
        name: "Issues Resolved", 
        number: "98%", 
        icon: <FaCheckCircle className="text-white text-[2rem]" />,
        description: "Average resolution rate",
        trend: "+5% improvement"
    },
    { 
        id: 3, 
        name: "Active Users", 
        number: "25K", 
        icon: <FaUserLarge className="text-white text-[2rem]" />,
        description: "Engaged community members",
        trend: "+18% growth"
    },
]

export default function Achievements() {
    return (
        <section className="relative z-10 -mt-10 md:-mt-16 lg:-mt-20 mx-4 md:mx-8 lg:mx-[7.5rem]" id="achievements">
            <div className="bg-white rounded-2xl lg:rounded-[2rem] shadow-2xl border border-light-gray/50 p-4 md:p-6 lg:p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                    {achievements.map((achievement, index) => (
                        <div 
                            key={achievement.id} 
                            className={`group relative overflow-hidden rounded-xl lg:rounded-2xl bg-gradient-to-br ${
                                index === 0 ? 'from-primary to-primary/80' :
                                index === 1 ? 'from-accent2 to-accent2/80' :
                                'from-accent to-accent/80'
                            } p-4 md:p-5 lg:p-6 text-white hover:scale-105 transition-all duration-300 hover:shadow-xl`}
                        >
                            {/* Background Pattern */}
                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
                            </div>
                            
                            <div className="relative z-10">
                                {/* Icon Container */}
                                <div className="flex items-center justify-between mb-3 md:mb-4">
                                    <div className="w-12 md:w-14 lg:w-16 h-12 md:h-14 lg:h-16 bg-white/20 rounded-xl lg:rounded-2xl flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                                        <div className="text-lg md:text-xl lg:text-2xl">
                                            {achievement.icon}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] md:text-xs bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
                                        <FaArrowUp className="text-[8px] md:text-[10px]" />
                                        <span className="hidden sm:inline">{achievement.trend}</span>
                                        <span className="sm:hidden">+{achievement.trend.split('%')[0].replace('+', '')}%</span>
                                    </div>
                                </div>
                                
                                {/* Stats */}
                                <div className="space-y-1 md:space-y-2">
                                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-none">
                                        {achievement.number}
                                    </h2>
                                    <h3 className="text-base md:text-lg font-semibold opacity-90">
                                        {achievement.name}
                                    </h3>
                                    <p className="text-xs md:text-sm opacity-75 leading-relaxed">
                                        {achievement.description}
                                    </p>
                                </div>
                                
                                {/* Progress Indicator */}
                                <div className="mt-4 pt-4 border-t border-white/20">
                                    <div className="flex items-center justify-between text-xs opacity-75">
                                        <span>Performance</span>
                                        <span>Excellent</span>
                                    </div>
                                    <div className="mt-1 w-full bg-white/20 rounded-full h-1">
                                        <div 
                                            className="bg-white rounded-full h-1 transition-all duration-1000 ease-out"
                                            style={{ width: index === 0 ? '85%' : index === 1 ? '98%' : '75%' }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Bottom Section */}
                <div className="mt-6 lg:mt-8 pt-4 lg:pt-6 border-t border-light-gray/30">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
                        <div className="text-center sm:text-left">
                            <h3 className="text-base md:text-lg font-semibold text-almost-black">Real-time Impact</h3>
                            <p className="text-xs md:text-sm text-neutral-text">Updated every 5 minutes</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-accent2 rounded-full animate-pulse"></div>
                            <span className="text-xs md:text-sm text-neutral-text">Live data</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}