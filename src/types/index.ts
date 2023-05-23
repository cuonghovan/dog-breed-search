export interface Breed {
	id: number;
	name?: string;
	height?: {
		imperial?: string;
		metric?: string;
	};
	weight?: {
		imperial?: string;
		metric?: string;
	};
	life_span?: string;
	description?: string;
	bred_for?: string;
	breed_group?: string;
	history?: string;
	temperament?: string;
	reference_image_id?: string;
	image?: string;
}
