interface BtnProps {
    test: string;
    toDo: () => void
}

export default function MainBtn({ test, toDo }: BtnProps) {
    return (
        <button 
            onClick={toDo}
            className={`rounded-[0.5rem] px-[2rem] py-[.4rem] bg-primary hover:bg-accent2 text-white font-semibold transition-all`}
        >
            {test}
        </button>
    )
}