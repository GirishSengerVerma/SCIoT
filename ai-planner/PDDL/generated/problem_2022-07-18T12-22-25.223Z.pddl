(define (problem weather-events-action-planning)
    (:domain weather-events-action-planning)
    (:objects
        stuttgart_vaihingen_office stuttgart_killesberg_park stuttgart_max_eyth_see authorities_hub - location
        ambulance-1 ambulance-2 ambulance-3 police_car-1 police_car-2 police_car-3 fire_truck-1 fire_truck-2 fire_truck-3 - unit
        storm hail_storm thunder_storm flood cold heat wild_fire earth_quake bad_air - weathereventtype
    )

    (:init
        ; Hub 
        (is-hub authorities_hub)

        ; Units: Types  
        (is-ambulance ambulance-1)
        (is-ambulance ambulance-2)
        (is-ambulance ambulance-3)
        (is-police-car police_car-1)
        (is-police-car police_car-2)
        (is-police-car police_car-3)
        (is-fire-truck fire_truck-1)
        (is-fire-truck fire_truck-2)
        (is-fire-truck fire_truck-3)

        ; Units: Positioning  
        (is-unit-at ambulance-1 authorities_hub)
        (is-unit-at ambulance-2 authorities_hub)
        (is-unit-at ambulance-3 authorities_hub)
        (is-unit-at police_car-1 authorities_hub)
        (is-unit-at police_car-2 authorities_hub)
        (is-unit-at police_car-3 authorities_hub)
        (is-unit-at fire_truck-1 stuttgart_killesberg_park)
        (is-unit-at fire_truck-2 stuttgart_max_eyth_see)
        (is-unit-at fire_truck-3 stuttgart_max_eyth_see)
        (= (units-at-hub) 6)

        ; Weather Events  

        ;    - at stuttgart_vaihingen_office
        (is-weather-event-at bad_air stuttgart_vaihingen_office)
        (= (current-risk bad_air stuttgart_vaihingen_office) 4)
        (needs-ambulance-at stuttgart_vaihingen_office)
        (needs-fire-truck-at stuttgart_vaihingen_office)
        (needs-police-car-at stuttgart_vaihingen_office)

        ;    - at stuttgart_killesberg_park

        ;    - at stuttgart_max_eyth_see

        ;    - at authorities_hub
    )

    (:goal
        (and
            ; All Units have to either perform actions at a Weather Event location or refuel and reequip at Hub 
            (unit-performed-action ambulance-1)
            (unit-performed-action ambulance-2)
            (unit-performed-action ambulance-3)
            (unit-performed-action police_car-1)
            (unit-performed-action police_car-2)
            (unit-performed-action police_car-3)
            (unit-performed-action fire_truck-1)
            (unit-performed-action fire_truck-2)
            (unit-performed-action fire_truck-3)

        )
    )

    (:metric minimize 
        (+ (* 9 
        (current-risk bad_air stuttgart_vaihingen_office) ) (units-at-hub)
        )
    )
)