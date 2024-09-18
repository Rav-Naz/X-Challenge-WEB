export interface Fight {
  czas_zakonczenia: number | null
  grupa_id: number
  nastepna_walka_id: number | null
  robot1_id: number | null
  robot1_nazwa: string | null
  robot1_uuid: string | null
  robot2_id: number | null
  robot2_nazwa: string | null
  robot2_uuid: string | null
  stanowisko_id: number | null
  nazwa_stanowiska: string | null
  walka_id: number
  wygrane_rundy_robot1: number | null
  wygrane_rundy_robot2: number | null
  uwagi: string | null
}
