(define (problem weather-events-action-planning-example-1)
    (:domain weather-events-action-planning)
    (:objects
        skp svo smes hub - location
        pc1 pc2 pc3 ft1 ft2 ft3 a1 a2 a3 - unit
        storm hailstorm thunderstorm flood cold heat wildfire earthquake badair - weathereventtype
    )

    (:init
        ; Hub
        (is-hub hub)

        ; Units: Types
        (is-police-car pc1)
        (is-police-car pc2)
        (is-police-car pc3)
        (is-fire-truck ft1)
        (is-fire-truck ft2)
        (is-fire-truck ft3)
        (is-ambulance a1)
        (is-ambulance a2)
        (is-ambulance a3)

        ; Units: Positioning
        (is-unit-at pc1 smes)
        (is-unit-at pc2 hub)
        (is-unit-at pc3 hub)
        (is-unit-at ft1 smes)
        (is-unit-at ft2 hub)
        (is-unit-at ft3 hub)
        (is-unit-at a1 smes)
        (is-unit-at a2 hub)
        (is-unit-at a3 hub)

        ; Weather Events at SKP
        (is-weatherevent-at wildfire skp)
        (needs-fire-truck-at skp)
        (needs-police-at skp)

        ; Weather Events at SVO
        (is-weatherevent-at badair svo)
        (needs-fire-truck-at svo)
        (needs-ambulance-at svo)
        (needs-police-at svo)
    )

    (:goal
        (and
            ; All units have to either perform actions at a weather event location or refuel and reequip at hub
            (unit-performed-action pc1)
            (unit-performed-action pc2)
            (unit-performed-action pc3)
            (unit-performed-action ft1)
            (unit-performed-action ft2)
            (unit-performed-action ft3)
            (unit-performed-action a1)
            (unit-performed-action a2)
            (unit-performed-action a3)

            ; Due to high risk for wild fire at SKP: need for fire truck and police
            (is-fire-truck-operating-at skp)
            (is-police-operating-at skp)

            ; Due to high risk for bad air at SVO: need for fire truck, police and ambulance there
            (is-fire-truck-operating-at svo)
            (is-police-operating-at svo)
            (is-ambulance-operating-at svo)
        )
    )
)