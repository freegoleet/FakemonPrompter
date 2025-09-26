import AnimatedWeather from './AnimatedWeather';
import HabitatBackground from './HabitatBackground';
import { type DataMap } from '../assets/utils/FakemonUtils';

interface AnimatedBackgroundProps {
    data: DataMap;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ data }: AnimatedBackgroundProps) => {
    return (
        <>
            <HabitatBackground data={data} />
            <AnimatedWeather data={data} />
        </>
    );
};

export default AnimatedBackground;