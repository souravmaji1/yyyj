import CommunityCrousel from "../crousels/communityCrousel";
import './responsive.mobile.css';

const Community = () => {
    return (
        <section className="pb-6 bg-[var(--color-bg)] relative community-mobile-fix">
            <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl md:text-6xl font-semibold mb-2 text-white">
                    Community Feedback
                </h2>
            </div>

            <div className="mx-auto">
                <CommunityCrousel />
            </div>

        </section>
    )
}

export default Community;