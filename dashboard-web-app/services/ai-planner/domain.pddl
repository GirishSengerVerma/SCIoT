; PDDL Domain Description. 
;   The goal is to move authorities units between different locations to tackle weather events there efficiently.
;   If there are no events anymore at a location, units should move back to the hub (e.g. to re-fuel and re-equip).

(define (domain weather-events-action-planning)

    (:requirements :strips :typing :equality :negative-preconditions :fluents :conditional-effects :disjunctive-preconditions)

    (:types
        location unit weathereventtype - object
    )

    (:predicates
        (is-hub ?l - location)
        (is-weather-event-at ?w - weathereventtype ?l - location)
        (needs-police-car-at ?l - location)
        (needs-fire-truck-at ?l - location)
        (needs-ambulance-at ?l - location)
        (is-unit-operating ?u - unit)
        (is-police-car-operating-at ?l - location)
        (is-fire-truck-operating-at ?l - location)
        (is-ambulance-operating-at ?l - location)
        (is-unit-at ?u - unit ?l - location)
        (is-police-car ?u - unit)
        (is-fire-truck ?u - unit)
        (is-ambulance ?u - unit)
        (unit-moved ?u - unit)
        (unit-performed-action ?u - unit)
    )

    (:functions
        (current-risk ?w - weathereventtype ?l - location)
        (units-at-hub)
    )

    (:action move-to-event-location
        :parameters (?unit - unit ?from - location ?to - location ?eventtype - weathereventtype)
        :precondition (and
            (is-unit-at ?unit ?from)
            (is-weather-event-at ?eventtype ?to)
            (not (is-unit-operating ?unit))
            (not (= ?from ?to))
            (not (unit-performed-action ?unit))
            (not (unit-moved ?unit))
        )
        :effect (and
            (not (is-unit-at ?unit ?from))
            (is-unit-at ?unit ?to)
            (unit-moved ?unit)
            (when
                (is-hub ?from)
                (decrease (units-at-hub) 1)
            )
        )
    )

    (:action perform-police-action
        :parameters (?unit - unit ?eventtype - weathereventtype ?location - location)
        :precondition (and
            (is-unit-at ?unit ?location)
            (is-police-car ?unit)
            (not (unit-performed-action ?unit))
            (not (is-unit-operating ?unit))
            (is-weather-event-at ?eventtype ?location)
            (needs-police-car-at ?location)
            (>= (current-risk ?eventtype ?location) 1)
        )
        :effect (and
            (is-unit-operating ?unit)
            (unit-performed-action ?unit)
            (is-police-car-operating-at ?location)
            (decrease
                (current-risk ?eventtype ?location)
                (* 0.5 (current-risk ?eventtype ?location)))
        )
    )

    (:action perform-fire-truck-action
        :parameters (?unit - unit ?eventtype - weathereventtype ?location - location)
        :precondition (and
            (is-unit-at ?unit ?location)
            (is-fire-truck ?unit)
            (not (is-unit-operating ?unit))
            (not (unit-performed-action ?unit))
            (is-weather-event-at ?eventtype ?location)
            (needs-fire-truck-at ?location)
            (>= (current-risk ?eventtype ?location) 1)
        )
        :effect (and
            (is-unit-operating ?unit)
            (unit-performed-action ?unit)
            (is-fire-truck-operating-at ?location)
            (decrease
                (current-risk ?eventtype ?location)
                (* 0.5 (current-risk ?eventtype ?location)))
        )
    )

    (:action perform-ambulance-action
        :parameters (?unit - unit ?eventtype - weathereventtype ?location - location)
        :precondition (and
            (is-unit-at ?unit ?location)
            (is-ambulance ?unit)
            (not (is-unit-operating ?unit))
            (not (unit-performed-action ?unit))
            (is-weather-event-at ?eventtype ?location)
            (needs-ambulance-at ?location)
            (>= (current-risk ?eventtype ?location) 1)
        )
        :effect (and
            (is-unit-operating ?unit)
            (unit-performed-action ?unit)
            (is-ambulance-operating-at ?location)
            (decrease
                (current-risk ?eventtype ?location)
                (* 0.5 (current-risk ?eventtype ?location)))
        )
    )

    (:action return-to-hub
        :parameters (?unit - unit ?from - location ?to - location)
        :precondition (and
            (is-unit-at ?unit ?from)
            (not (is-hub ?from))
            (is-hub ?to)
            (not (is-unit-operating ?unit))
            (not (unit-moved ?unit))
        )
        :effect (and
            (not (is-unit-at ?unit ?from))
            (is-unit-at ?unit ?to)
            (unit-moved ?unit)
            (increase (units-at-hub) 1)
        )
    )

    (:action refuel-and-reequip-at-hub
        :parameters (?unit - unit ?location - location)
        :precondition (and
            (is-unit-at ?unit ?location)
            (is-hub ?location)
            (not (unit-performed-action ?unit))
            (or
                (not (is-police-car ?unit))
                (not (exists
                        (?l - location ?w - weathereventtype)
                        (and
                            (is-weather-event-at ?w ?l)
                            (>= 1 (current-risk ?w ?l))
                            (needs-police-car-at ?l)
                        )
                    )
                )
            )
            (or
                (not (is-ambulance ?unit))
                (not (exists
                        (?l - location ?w - weathereventtype)
                        (and
                            (is-weather-event-at ?w ?l)
                            (>= 1 (current-risk ?w ?l))
                            (needs-ambulance-at ?l)
                        )
                    )
                )
            )
            (or
                (not (is-fire-truck ?unit))
                (not (exists
                        (?l - location ?w - weathereventtype)
                        (and
                            (is-weather-event-at ?w ?l)
                            (>= 1 (current-risk ?w ?l))
                            (needs-fire-truck-at ?l)
                        )
                    )
                )
            )
        )
        :effect (and
            (unit-performed-action ?unit)
        )
    )
)