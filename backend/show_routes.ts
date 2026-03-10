import productRoutes from './src/routes/productRoutes';

productRoutes.stack.forEach((r: any) => {
    if (r.route && r.route.path) {
        console.log(r.route.path, Object.keys(r.route.methods));
    }
});
