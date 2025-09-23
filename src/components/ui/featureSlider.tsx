interface FeatureSliderProps {
    key: string;
    feature: string;
}

const FeatureSlider = ({ key, feature }: FeatureSliderProps) => {
    return (
        <div key={key} className="flex items-center">
            <span className="text-[var(--color-primary)] mx-2 sm:mx-4 text-sm sm:text-base">★</span>
            <span className="text-sm sm:text-base md:text-lg font-medium text-white mx-2 sm:mx-4">{feature}</span>
        </div>
    )
}

export default FeatureSlider;