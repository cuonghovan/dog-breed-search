import BreedRow from './BreedRow';
import { Breed } from './../types';

interface BreedTableProps {
	breeds: Breed[];
}

const BreedTable: React.FC<BreedTableProps> = ({ breeds }) => (
	<table className='table-auto min-w-full boder-b-2 border-gray-200'>
		<thead>
			<tr>
				<th className='pl-10 py-3 border-b-2 border-gray-200 bg-gray-100 w-1/3 text-left text-md font-semibold text-gray-700 uppercase'>
					Photo
				</th>
				<th className='px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-md font-semibold text-gray-700 uppercase'>
					Information
				</th>
			</tr>
		</thead>
		<tbody>
			{breeds.length > 0 ? (
				<>
					{breeds.map((breed: Breed) => (
						<BreedRow key={breed.id} breed={breed} />
					))}
				</>
			) : (
				<tr>
					<td
						colSpan={2}
						className='pl-10 py-5 border-b border-gray-200 bg-white text-sm'
					>
						No matching dog breeds found.
					</td>
				</tr>
			)}
		</tbody>
	</table>
);

export default BreedTable;
