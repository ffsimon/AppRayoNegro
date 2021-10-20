export class GeocoderResult {
  latitude?: string;
  longitude?: string;
  countryCode?: string;
  countryName?: string;
  postalCode?: string;
  administrativeArea?: string;
  subAdministrativeArea?: string;
  locality?: string;
  subLocality?: string;
  thoroughfare?: string;
  subThoroughfare?: string;
}

export class GeocoderGoogleResult {
  calle: string;
  colonia: string;
  municipio: string;
  estado: string;
  codigoPostal: string;
  latitud: number;
  longitud: number;
  direccion_completa?: string;
}
