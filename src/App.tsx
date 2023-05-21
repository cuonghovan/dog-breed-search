import { useEffect, useState } from 'react'
import axios from 'axios';
import defaultImage from './images/dog.png'
import './App.css'

enum SORT_OPTION {
  NAME = 'name',
  HEIGHT = 'height',
  LIFESPAN = 'lifespan' 
}

function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [breeds, setBreeds] = useState([])
  const [selectedSortOption, setSelectedSortOption] = useState<SORT_OPTION>(SORT_OPTION.NAME)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>)=> {
    setSearchTerm(e.target.value)
  }

  useEffect(() => {
    const searchDelay = setTimeout(() => {
      const baseRequestOptions = {
        baseURL: 'https://api.thedogapi.com/v1',
        headers: {
          'x-api-key': process.env.REACT_APP_DOG_API_KEY
        }
      }

      axios.get('/breeds/search?q=' + searchTerm, {
        ...baseRequestOptions,
      }).then(async function(response) {
        const breeds = response.data
        const imageMap = new Map()
        const imgRequests = breeds.map((breed:any) => {
          if (breed.reference_image_id) {
            return axios.get('/images/' + breed.reference_image_id, {
              ...baseRequestOptions,
            }).then(function(response) {
              const image = response.data
              if(!imageMap.has(image.id)) {
                imageMap.set(image.id, image.url)
              }
            }).catch(function(error) {
              console.log(error)
            })
          }
          return null
        })

        // Wait until all images downloaded
        await Promise.all(imgRequests)
        breeds.forEach((breed: any, index: number) => {
          breeds[index] = {...breed, imageUrl: breed.reference_image_id ? imageMap.get(breed.reference_image_id) : defaultImage}
        })
        setBreeds(breeds)
        setSelectedSortOption(SORT_OPTION.NAME)
      }).catch(function(error) {
        console.log(error)
      })
    }, 1000)

    return () => clearTimeout(searchDelay)
  }, [searchTerm])

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOption = e.target.value as SORT_OPTION
    setSelectedSortOption(selectedOption)

    switch(selectedOption) {
      case SORT_OPTION.NAME:
        sortByName()
        break
      case SORT_OPTION.HEIGHT:
        sortByHeight()
        break
      case SORT_OPTION.LIFESPAN:
        sortByLifespan()
        break
      default:
        sortByName()
        break
    }
  }

  const sortByName = () => {
    const sortedBreeds = [...breeds]
    sortedBreeds.sort((breedA: any, breedB: any) => {
      if (breedA.name < breedB.name) return -1;
      if (breedA.name > breedB.name) return 1;
      return 0;
    })
    setBreeds(sortedBreeds)
  }

  const sortByHeight = () => {
    const sortedBreeds = [...breeds]
    sortedBreeds.sort((breedA: any, breedB: any) => {
      const imperialA = parseFloat(breedA.height.imperial.split(' - ')[0])
      const imperialB = parseFloat(breedB.height.imperial.split(' - ')[0])
      return imperialA - imperialB
    })
    setBreeds(sortedBreeds)
  }

  const sortByLifespan = () => {
    const sortedBreeds = [...breeds]
    sortedBreeds.sort((breedA: any, breedB: any) => {
      const lifespanA = parseFloat(breedA.life_span.match(/\d+/g)[0])
      const lifespanB = parseFloat(breedB.life_span.match(/\d+/g)[0])
      return lifespanA - lifespanB
    })
    setBreeds(sortedBreeds)
  }

  return (
    <div className='container mx-auto px-4 min-h-screen bg-cyan-50'>
      <header className='flex justify-center pt-16 text-3xl capitalize'>Search Dogs</header>
      <section className='flex justify-center mt-16'>
          <input className='w-80 p-4 rounded-md' type='text' placeholder='Enter breed name' value={searchTerm} onChange={handleSearchChange} />
          <select className='w-30 p-4 ml-4 bg-white' value={selectedSortOption} onChange={handleSortChange}>
            <option value={SORT_OPTION.NAME} defaultChecked>Name</option>
            <option value={SORT_OPTION.HEIGHT}>Height</option>
            <option value={SORT_OPTION.LIFESPAN}>Lifespan</option>
          </select>
      </section>
      <section className='mt-16'>
          <table className='table-auto min-w-full boder-b-2 border-gray-200'>
            <thead>
              <tr>
                <th className='px-5 py-3 border-b-2 border-gray-200 bg-gray-100 w-1/3 text-left text-xs font-semibold text-gray-700 uppercase'>Image</th>
                <th className='px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase'>Description</th>
              </tr>
            </thead>
            <tbody>
              {breeds.length > 0 ?
                <>
                  {breeds.map((breed: any) => (
                    <tr key={breed.id}>
                      <td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'><img src={breed.imageUrl} alt={breed.name} width='300' height='auto' /></td>
                      <td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>
                        <ul>
                          <li><b>Name:</b> {breed.name}</li>
                          <li><b>Height:</b> {breed.height.imperial} inches</li>
                          <li><b>Lifespan:</b> {breed.life_span}</li>
                        </ul>
                      </td>
                    </tr>
                  ))}
                </>
                : <tr>
                  <td colSpan={2} className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>No dog to be shown</td>
                </tr>
              }
            </tbody>
          </table>
      </section>
    </div>
  )
}

export default App;
