import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Breed } from './../types';
import pulse from './../images/pulse.gif';

interface BreedRowProps {
	breed: Breed;
}

const BreedRow: React.FC<BreedRowProps> = ({ breed }) => (
	<tr>
		<td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>
			<div className='w-full h-auto px-5'>
				<LazyLoadImage
					src={breed.image}
					alt={breed.name}
					className='w-full h-auto'
					onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
						const target = e.target as HTMLImageElement;
						target.src = `https://cdn2.thedogapi.com/images/${breed.reference_image_id}.png`;
					}}
					placeholderSrc={pulse}
				/>
			</div>
		</td>
		<td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>
			<ul>
				{breed.name && (
					<li>
						<strong>Name:</strong> {breed.name}
					</li>
				)}

				{breed.description && (
					<li>
						<strong>Description:</strong> {breed.description}
					</li>
				)}
				{breed.height && (
					<li>
						<strong>Height:</strong> {breed.height.metric} cm
					</li>
				)}
				{breed.weight && (
					<li>
						<strong>Weight:</strong> {breed.weight.metric} kg
					</li>
				)}
				{breed.life_span && (
					<li>
						<strong>Lifespan:</strong> {breed.life_span}
					</li>
				)}
				{breed.bred_for && (
					<li>
						<strong>Bred for:</strong> {breed.bred_for}
					</li>
				)}
				{breed.breed_group && (
					<li>
						<strong>Breed group:</strong> {breed.breed_group}
					</li>
				)}
				{breed.temperament && (
					<li>
						<strong>Temperament:</strong> {breed.temperament}
					</li>
				)}
			</ul>
		</td>
	</tr>
);

export default BreedRow;
