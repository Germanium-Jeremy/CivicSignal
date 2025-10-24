import { FaCheckCircle } from "react-icons/fa"
import { FaLocationPin, FaUserLarge } from "react-icons/fa6"

const achievements = [
    { id: 1, name: "Reported Issues", number: "1.5M", icon: <FaLocationPin className="text-accent2 text-[3rem]" /> },
    { id: 2, name: "Issues Resolved", number: "125", icon: <FaCheckCircle className="text-accent2 text-[3rem]" /> },
    { id: 3, name: "Active Users", number: "25K", icon: <FaUserLarge className="text-accent2 text-[3rem]" /> },
]

export default function Achievements() {
    return (
        <section className="py-[3rem] px-[5rem] bg-white flex gap-[2rem] items-center justify-around absolute right-[7.5rem] left-[7.5rem] top-[44rem] rounded-[1.25rem]">
            {achievements.map((achievement) => (
                <div key={achievement.id} className={`flex gap-[2rem] px-[6rem] items-center ${achievement.id === 2 && "border-x-[0.1rem]"}`}>
                    {achievement.icon}
                    <div className="w-full">
                        <h2 className="text-[2rem] font-semibold text-center">{achievement.number}</h2>
                        <p className="text-neutral-text text-center">{achievement.name}</p>
                    </div>
                </div>
            ))}
        </section>
    )
}