(define (problem weather-events-action-planning-example-1)
    (:domain weather-events-action-planning)
    (:objects
        skp svo smes hub - location
        pc1 pc2 ft1 ft2 a1 a2 - unit
        storm hailstorm thunderstorm flood cold heat wildfire earthquake badair - weathereventtype
    )

    (:init
        ; Hub
        (is-hub hub)

        ; Units: Types
        (is-police-car pc1)
        (is-police-car pc2)
        (is-fire-truck ft1)
        (is-fire-truck ft2)
        (is-ambulance a1)
        (is-ambulance a2)

        ; Units: Positioning
        (is-unit-at pc1 hub)
        (is-unit-at pc2 hub)
        (is-unit-at ft1 hub)
        (is-unit-at ft2 hub)
        (is-unit-at a1 hub)
        (is-unit-at a2 hub)
        (= (units-at-hub) 6)

        ; Weather Events at SKP
        (is-weather-event-at wildfire skp)
        (= (current-risk wildfire skp) 5)
        (needs-fire-truck-at skp)
        (needs-police-car-at skp)

        ; Weather Events at SVO
        (is-weather-event-at badair svo)
        (= (current-risk badair svo) 2)
        (needs-fire-truck-at svo)
        (needs-ambulance-at svo)
        (needs-police-car-at svo)
    )

    (:goal
        (and
            ; All units have to either perform actions at a weather event location or refuel and reequip at hub
            (unit-performed-action pc1)
            (unit-performed-action pc2)
            (unit-performed-action ft1)
            (unit-performed-action ft2)
            (unit-performed-action a1)
            (unit-performed-action a2)
        )
    )

    (:metric minimize
        (+
            (+
                (current-risk wildfire skp)
                (current-risk badair svo)
            )
            (units-at-hub)
        )
    )
)