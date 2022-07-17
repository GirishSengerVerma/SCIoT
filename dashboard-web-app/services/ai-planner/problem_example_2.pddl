(define (problem weather-events-action-planning-example-1)
    (:domain weather-events-action-planning)
    (:objects
        skp svo smes hub - location
        pc1 ft1 a1 - unit
        storm hailstorm thunderstorm flood cold heat wildfire earthquake badair - weathereventtype
    )

    (:init
        ; Hub
        (is-hub hub)

        ; Units: Types
        (is-police-car pc1)
        (is-fire-truck ft1)
        (is-ambulance a1)

        ; Units: Positioning
        (is-unit-at pc1 smes)
        (is-unit-at ft1 hub)
        (is-unit-at a1 hub)
        (= (units-at-hub) 2)

        ; Weather Events at SKP
        (is-weather-event-at wildfire skp)
        (= (current-risk wildfire skp) 3)
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
            (unit-performed-action ft1)
            (unit-performed-action a1)
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