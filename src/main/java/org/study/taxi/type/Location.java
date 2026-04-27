package org.study.taxi.type;

public enum Location {

    CITY_CENTRE(1),
    SUBURB(2),
    AIRPORT(3);


    public final double modifier;

    private Location(double _modifier) {
        modifier = _modifier;
    }
}
