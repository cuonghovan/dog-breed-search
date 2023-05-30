import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { BreedTable, ErrorToast } from './components';
import { Breed } from './types';
import defaultImage from './images/dog.png';
import 'react-toastify/dist/ReactToastify.css';

enum SORT_OPTION {
	NAME = 'name',
	HEIGHT = 'height',
	LIFESPAN = 'lifespan'
}

function App() {
	const [searchTerm, setSearchTerm] = useState<string>('');
	const [breeds, setBreeds] = useState<Breed[]>([]);
	const [selectedSortOption, setSelectedSortOption] = useState<SORT_OPTION>(SORT_OPTION.NAME);
	const [loading, setLoading] = useState<boolean>(false);

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
	};

	useEffect(() => {
		const timerId = setTimeout(async () => {
			const baseRequestOptions = {
				baseURL: 'https://api.thedogapi.com/v1',
				headers: {
					'x-api-key': process.env.REACT_APP_DOG_API_KEY,
				},
			};

			try {
				setLoading(true);
				const breedResponse = await axios.get(
					'/breeds/search?q=' + searchTerm,
					{
						...baseRequestOptions,
					}
				);
				const breeds = breedResponse.data;
				breeds.forEach((breed: Breed, index: number, arr: Breed[]) => {
					if (breed.reference_image_id) {
						arr[index] = {...breed, image: `https://cdn2.thedogapi.com/images/${breed.reference_image_id}.jpg`}
					} else {
						arr[index] = {...breed, image: defaultImage}
					}
				})
				setBreeds(breeds);
			} catch (error) {
				console.log(error);
				toast.error(<ErrorToast />);
			} finally {
				setLoading(false);
			}
		}, 1000);

		return () => clearTimeout(timerId);
	}, [searchTerm]);

	const sortByName = (breeds: Breed[]) => {
		breeds.sort((breedA: any, breedB: any) => {
			const breedAName = breedA.name.toLowerCase();
			const breedBName = breedB.name.toLowerCase();
			if (breedAName < breedBName) return -1;
			if (breedAName > breedBName) return 1;
			return 0;
		});
	};

	const sortByHeight = (breeds: Breed[]) => {
		breeds.sort((breedA: any, breedB: any) => {
			const heightA = parseFloat(breedA.height.metric.split(' - ')[0]);
			const heightB = parseFloat(breedB.height.metric.split(' - ')[0]);
			return heightA - heightB;
		});
	};

	const sortByLifespan = (breeds: Breed[]) => {
		breeds.sort((breedA: any, breedB: any) => {
			const lifespanA = parseFloat(breedA.life_span.match(/\d+/g)[0]);
			const lifespanB = parseFloat(breedB.life_span.match(/\d+/g)[0]);
			return lifespanA - lifespanB;
		});
	};

	const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const selectedOption = e.target.value as SORT_OPTION;
		setSelectedSortOption(selectedOption);
	};

	const sortedBreeds = useMemo(() => {
		const breedsCopy = [...breeds];
		switch (selectedSortOption) {
			case SORT_OPTION.NAME:
				sortByName(breedsCopy);
				break;
			case SORT_OPTION.HEIGHT:
				sortByHeight(breedsCopy);
				break;
			case SORT_OPTION.LIFESPAN:
				sortByLifespan(breedsCopy);
				break;
			default:
				sortByName(breedsCopy);
				break;
		}
		return breedsCopy;
	}, [breeds, selectedSortOption]);

	return (
		<div className='container mx-auto px-4 min-h-screen bg-cyan-50'>
			<header className='flex justify-center pt-16 text-3xl capitalize'>
				Explore Dog Breeds
			</header>
			<section className='flex justify-center mt-16'>
				<input
					className='w-80 p-4 rounded-md outline-none'
					type='text'
					placeholder='Enter a dog breed name'
					value={searchTerm}
					onChange={handleSearchChange}
				/>
				<div className='relative ml-4'>
					<select
						className='w-32 p-4 rounded-md bg-white appearance-none outline-none'
						value={selectedSortOption}
						onChange={handleSortChange}
					>
						<option value={SORT_OPTION.NAME} defaultChecked>
							Name
						</option>
						<option value={SORT_OPTION.HEIGHT}>Height</option>
						<option value={SORT_OPTION.LIFESPAN}>Lifespan</option>
					</select>
					<div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-4'>
						<svg
							className='w-4 h-4'
							viewBox='0 0 20 20'
							fill='currentColor'
							aria-hidden='true'
						>
							<path fillRule='evenodd' d='M6 8l4 4 4-4' />
						</svg>
					</div>
				</div>
			</section>
			<section className='mt-16 relative'>
				{loading && (
					<div className='absolute t-0 l-0  w-full h-full z-100 animate-pulse bg-slate-100 bg-opacity-70' />
				)}
				<BreedTable breeds={sortedBreeds} />
			</section>
			<ToastContainer
				position='bottom-right'
				autoClose={5000}
				hideProgressBar={false}
				newestOnTop={false}
				closeOnClick
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover
				theme='light'
			/>
		</div>
	);
}

export default App;
