import { render, screen, within } from '@testing-library/react'
import axios from 'axios'
import App from './App'
import userEvent from '@testing-library/user-event';

jest.mock('axios')

describe('App', () => {
  test('render app correctly', async () => {
    render(<App />)
    
    expect(screen.getByText('Search Dogs')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter breed name')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByRole('cell')).toHaveTextContent('No dog to be shown')
  })

  test('render app and fetch dog breeds with images then sort results', async () => {
    jest.useFakeTimers();
    
    const mockBreeds: any[] = [
      {
        id: 1,
        name: 'Bulldog A',
        height: { imperial: '12 - 16' },
        life_span: '6 - 10 years',
        reference_image_id: 'abc1',
      },
      {
        id: 2,
        name: 'Bulldog B',
        height: { imperial: '10 - 16' },
        life_span: '5 - 10 years',
        reference_image_id: 'abc2',
      },
      {
        id: 3,
        name: 'Bulldog C',
        height: { imperial: '13 - 16' },
        life_span: '4 - 10 years',
        reference_image_id: 'abc3',
      },
    ];
    const mockImageA: any = {
      id: 'abc1',
      url: 'https://example.com/bulldogA.png'
    };
    const mockImageB: any = {
      id: 'abc2',
      url: 'https://example.com/bulldogB.png'
    };
    const mockImageC: any = {
      id: 'abc3',
      url: 'https://example.com/bulldogC.png'
    };

    (axios.get as jest.Mock).mockImplementation((url) => {
      switch (url) {
        case '/breeds/search?q=bulldog':
          return Promise.resolve({ data: mockBreeds });
        case '/images/abc1':
          return Promise.resolve({ data: mockImageA })
        case '/images/abc2':
          return Promise.resolve({ data: mockImageB })
        case '/images/abc3':
          return Promise.resolve({ data: mockImageC })
        default:
          return Promise.reject(new Error('not found'))
      }
    })

    render(<App />)

    // Search for dog breeds
    userEvent.type(screen.getByPlaceholderText('Enter breed name'), 'bulldog')
    jest.advanceTimersByTime(1000);

    await screen.findByText('Bulldog A')
    expect(screen.getByAltText('Bulldog A')).toHaveAttribute('src', 'https://example.com/bulldogA.png')
    expect(screen.getByAltText('Bulldog B')).toHaveAttribute('src', 'https://example.com/bulldogB.png')
    expect(screen.getByAltText('Bulldog C')).toHaveAttribute('src', 'https://example.com/bulldogC.png')


    const sortCases = [
      { sortBy: 'name',  firstDogName: 'Bulldog A'},
      { sortBy: 'height',  firstDogName: 'Bulldog B'},
      { sortBy: 'lifespan',  firstDogName: 'Bulldog C'}
    ]
    // Sort dog breeds
    sortCases.forEach(sortData => {
      userEvent.selectOptions(screen.getByRole('combobox'), sortData.sortBy)
      const firstRow = screen.getAllByRole('row')[1]
      const firstDescriptionCell = within(firstRow).getAllByRole('cell')[1]
      const textContent = within(firstDescriptionCell).getByText(sortData.firstDogName)
      expect(!!textContent).toBe(true)
    })

    jest.useRealTimers();
  })
})