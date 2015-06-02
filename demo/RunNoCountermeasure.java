package demo;

import boot.*;
import utility.*;
import client.*;
import server.*;

import java.util.List;

public class RunNoCountermeasure {
	private BootParams bootParams;
	// cell size
	public static double cellsize = 0.05; // in degree
	// multiple times for MTP
	public static double multitimes = 5;

	public RunNoCountermeasure(BootParams bp) {
		this.bootParams = bp;
	}

	public void run() {
		bootParams.printParams();
		/* initialize number of channels */
		int Number_Of_Channels = bootParams.getNumberOfChannels();

		/* initialize map */
		Location upperLeft = new Location(bootParams.getNorthLat(), bootParams.getWestLng());
		Location upperRight = new Location(bootParams.getNorthLat(), bootParams.getEastLng());
		Location lowerLeft = new Location(bootParams.getSouthLat(), bootParams.getWestLng());
		Location lowerRight = new Location(bootParams.getSouthLat(), bootParams.getEastLng());
		GridMap map = new GridMap(upperLeft, upperRight, lowerLeft, lowerRight, cellsize);

		/* debug information */
		System.out.println("Map length: " + map.getLength() + " km, Map height: " + map.getHeight() + " km");
		System.out.println("map rows: " + map.getRows() + ", map cols: " + map.getCols());
		map.showBoundary();

		/* change MTP scale */
		MTP.ChangeMult(multitimes);

		/* initialize server */
		Server server = new Server(map);
		/* Specify number of channels for server */
		server.setNumberOfChannels(Number_Of_Channels);

		/* Add a PU to the server's grid map */
		int PUid = 0;
		for (int k = 0; k < Number_Of_Channels; k++) {
			List<LatLng> LatLngList = bootParams.getPUOnChannel(k);
			for (LatLng ll : LatLngList) {
				PU pu = new PU(PUid++, ll.getLat(), ll.getLng(), map);
				System.out.println("k: " + k);
				server.addPU(pu, k);
			}
		}

		/* debug information */
		System.out.println("Number of PUs: " + server.getNumberOfPUs());
		server.printInfoChannel();
		System.out.println();

		// initiliza a client
		Client client = new Client(0, 0, map);

		/* Specify number of channels for client */
		client.setNumberOfChannels(Number_Of_Channels);

		/* Assume that we use random location for queries now */
		int Number_of_Queries = bootParams.getNumberOfQueries();
		if (Number_of_Queries == -1) {
			// read from file
		}
		else {
			for (int i = 0; i < Number_of_Queries; i++) {
				client.randomLocation();
				client.query(server);
			}
		}

		/* debug information */
		client.updateWhich();
		server.printInfoPU();

		/*** these functions should be update! ***/
		for (int i = 0; i < Number_Of_Channels; i++) {
			// client.plotInferMap(i);
			// client.printFormattedMatrix(i);
			// client.printFormattedTable(i);
		}

		/* compute IC */
		double[] IC = client.computeIC(server);
		for (int i = 0; i < IC.length; i++) {
			System.out.println("Channel " + i + " : " + IC[i]);
		}
	}
}