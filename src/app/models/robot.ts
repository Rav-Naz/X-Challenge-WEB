export interface Robot {
  kategorie: string,
  nazwa_robota: string,
  robot_id: number,
  robot_uuid: string,
  czy_dotarl: number,
  link_do_dokumentacji: string | null,
  link_do_filmiku: string | null,
  link_do_filmiku_2: string | null,
  powod_odrzucenia: string | null
  waga: number | null
}
