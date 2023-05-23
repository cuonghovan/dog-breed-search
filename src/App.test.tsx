import {
	render,
	screen,
	within,
	fireEvent,
	act,
	waitFor,
} from '@testing-library/react';
import axios from 'axios';
import App from './App';

jest.mock('axios');

describe('App', () => {
	test('render app correctly', async () => {
		render(<App />);

		expect(screen.getByText('Explore Dog Breeds')).toBeInTheDocument();
		expect(
			screen.getByPlaceholderText('Enter a dog breed name')
		).toBeInTheDocument();
		expect(screen.getByRole('combobox')).toBeInTheDocument();
		expect(screen.getByRole('table')).toBeInTheDocument();
		expect(screen.getByRole('cell')).toHaveTextContent(
			'No matching dog breeds found.'
		);
	});

	test('user input should be debounced for 1 sec', async () => {
		jest.useFakeTimers();

		(axios.get as jest.Mock).mockImplementation(() => {
			return Promise.resolve({
				data: [
					{
						id: 1,
						name: 'Bulldog A',
						height: { metric: '53 - 58' },
						life_span: '6 - 10 years',
            weight: {
              imperial: '60 - 120',
              metric: '27 - 54',
            },
            breed_group: 'Working',
            temperament:
              'Friendly, Assertive, Energetic, Loyal, Gentle, Confident, Dominant'
					}
				],
			});
		});

		render(<App />);

		const searchInput = screen.getByPlaceholderText('Enter a dog breed name');
		fireEvent.change(searchInput, { target: { value: 'b' } });
		expect(axios.get).not.toBeCalled();
		fireEvent.change(searchInput, { target: { value: 'bu' } });
		act(() => jest.advanceTimersByTime(1000));
		expect(axios.get).toHaveBeenCalledTimes(1);
		expect(axios.get).toHaveBeenCalledWith('/breeds/search?q=bu', {
			baseURL: 'https://api.thedogapi.com/v1',
			headers: { 'x-api-key': process.env.REACT_APP_DOG_API_KEY },
		});
		expect(await screen.findByText('Bulldog A')).toBeInTheDocument();

		jest.useRealTimers();
	});

	test('fetch dog breeds with images then sort results correctly', async () => {
		jest.useFakeTimers();

		const mockBreeds: any[] = [
			{
				id: 1,
				name: 'Bulldog A',
				height: { metric: '52 - 56', imperial: '18 - 24' },
				life_span: '6 - 10 years',
				reference_image_id: 'abc1',
				weight: {
					imperial: '55 - 90',
					metric: '25 - 41',
				},
				description:
					"The Alapaha Blue Blood Bulldog is a well-developed, exaggerated bulldog with a broad head and natural drop ears. The prominent muzzle is covered by loose upper lips. The prominent eyes are set well apart. The Alapaha's coat is relatively short and fairly stiff. Preferred colors are blue merle, brown merle, or red merle all trimmed in white or chocolate and white. Also preferred are the glass eyes (blue) or marble eyes (brown and blue mixed in a single eye). The ears and tail are never trimmed or docked. The body is sturdy and very muscular. The well-muscled hips are narrower than the chest. The straight back is as long as the dog is high at the shoulders. The dewclaws are never removed and the feet are cat-like.",
				bred_for: 'Guarding',
				breed_group: 'Mixed',
				history: '',
				temperament: 'Loving, Protective, Trainable, Dutiful, Responsible',
			},
			{
				id: 2,
				name: 'Bulldog B',
				height: { metric: '50 - 56' },
				life_span: '5 - 10 years',
				weight: {
					imperial: '60 - 120',
					metric: '27 - 54',
				},
				reference_image_id: 'abc2',
				breed_group: 'Working',
				temperament:
					'Friendly, Assertive, Energetic, Loyal, Gentle, Confident, Dominant',
			},
			{
				id: 3,
				name: 'Bulldog C',
				height: { metric: '53 - 56' },
				life_span: '4 - 10 years',
				reference_image_id: 'abc3',
				weight: {
					imperial: '30 - 150',
					metric: '14 - 68',
				},
				country_code: 'US',
				bred_for: 'Family companion dog',
				breed_group: '',
				temperament:
					'Strong Willed, Stubborn, Friendly, Clownish, Affectionate, Loyal, Obedient, Intelligent, Courageous',
			},
		];
		const mockImageA: any = {
			id: 'abc1',
			url: 'https://example.com/bulldogA.png',
		};
		const mockImageB: any = {
			id: 'abc2',
			url: 'https://example.com/bulldogB.png',
		};
		const mockImageC: any = {
			id: 'abc3',
			url: 'https://example.com/bulldogC.png',
		};

		(axios.get as jest.Mock).mockImplementation((url) => {
			switch (url) {
				case '/breeds/search?q=bulldog':
					return Promise.resolve({ data: mockBreeds });
				case '/images/abc1':
					return Promise.resolve({ data: mockImageA });
				case '/images/abc2':
					return Promise.resolve({ data: mockImageB });
				case '/images/abc3':
					return Promise.resolve({ data: mockImageC });
				default:
					return Promise.reject(new Error('not found'));
			}
		});

		render(<App />);

		fireEvent.change(screen.getByPlaceholderText('Enter a dog breed name'), {
			target: { value: 'bulldog' },
		});
		act(() => jest.advanceTimersByTime(1000));

		expect(await screen.findByText('Bulldog A')).toBeInTheDocument();
		expect(screen.getByText('Bulldog B')).toBeInTheDocument();
		expect(screen.getByText('Bulldog C')).toBeInTheDocument();

		const sortCases = [
			{ sortOption: 'name', firstDogName: 'Bulldog A' },
			{ sortOption: 'height', firstDogName: 'Bulldog B' },
			{ sortOption: 'lifespan', firstDogName: 'Bulldog C' },
		];
		sortCases.forEach((sortData) => {
			fireEvent.change(screen.getByRole('combobox'), {
				target: { value: sortData.sortOption },
			});
			const firstRow = screen.getAllByRole('row')[1];
			const firstDescriptionCell = within(firstRow).getAllByRole('cell')[1];
			const textContent = within(firstDescriptionCell).getByText(
				sortData.firstDogName
			);
			expect(!!textContent).toBe(true);
		});

		jest.useRealTimers();
	});

	test('handle errors when fetching dog breeds', async () => {
		jest.useFakeTimers();
		const consoleSpy = jest.spyOn(console, 'log');

		(axios.get as jest.Mock).mockImplementation(() => Promise.reject('abc'));

		render(<App />);

		fireEvent.change(screen.getByPlaceholderText('Enter a dog breed name'), {
			target: { value: 'bulldog' },
		});
		act(() => jest.advanceTimersByTime(1000));
		await waitFor(() => expect(consoleSpy).toHaveBeenLastCalledWith('abc'));

		consoleSpy.mockRestore();
		jest.useRealTimers();
	});

	test('handle errors when fetching images', async () => {
		jest.useFakeTimers();
		const consoleSpy = jest.spyOn(console, 'log');
		const mockBreeds: any[] = [
			{
				id: 1,
				name: 'Bulldog A',
				height: { metric: '52 - 56' },
				life_span: '6 - 10 years',
				reference_image_id: 'abc1',
				weight: {
					imperial: '60 - 120',
					metric: '27 - 54',
				},
				breed_group: 'Working',
				temperament:
					'Friendly, Assertive, Energetic, Loyal, Gentle, Confident, Dominant'
			},
		];
		(axios.get as jest.Mock).mockImplementation((url) => {
			switch (url) {
				case '/breeds/search?q=bulldog':
					return Promise.resolve({ data: mockBreeds });
				case '/images/abc1':
					return Promise.reject('xyz');
			}
		});

		render(<App />);

		fireEvent.change(screen.getByPlaceholderText('Enter a dog breed name'), {
			target: { value: 'bulldog' },
		});
		act(() => jest.advanceTimersByTime(1000));

		await waitFor(() => expect(consoleSpy).toHaveBeenLastCalledWith('xyz'));

		consoleSpy.mockRestore();
		jest.useRealTimers();
	});
});
