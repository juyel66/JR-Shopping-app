import React, { useEffect, useState } from 'react';
import { addToDb, deleteShoppingCart, getShoppingCart } from '../../utilities/fakedb';
import Cart from '../Cart/Cart';
import Product from '../Product/Product';
import './Shop.css';
import { Link } from 'react-router-dom';

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [itemPerPage, setItemPerPage] = useState(10);
    const [count, setCount] = useState(0);

    const numberOfPages = Math.ceil(count / itemPerPage);
    const pages = [...Array(numberOfPages).keys()];

    useEffect(() => {
        fetch('http://localhost:5000/productsCount')
        .then(res => res.json())
        .then(data => setCount(data.count))
    }, []);

    useEffect(() => {
        fetch(`http://localhost:5000/products?page=${currentPage}&size=${itemPerPage}`)
            .then(res => res.json())
            .then(data => setProducts(data))
    }, [currentPage, itemPerPage]);

    useEffect(() => {
        const storedCart = getShoppingCart();
        const savedCart = [];
        
        for (const id in storedCart) {
            const addedProduct = products.find(product => product._id === id)
            if (addedProduct) {
                const quantity = storedCart[id];
                addedProduct.quantity = quantity;
                savedCart.push(addedProduct);
            }
        }
        
        setCart(savedCart);
    }, [products]);

    const handleAddToCart = (product) => {
        let newCart = [];
        const exists = cart.find(pd => pd._id === product._id);
        if (!exists) {
            product.quantity = 1;
            newCart = [...cart, product]
        } else {
            exists.quantity = exists.quantity + 1;
            const remaining = cart.filter(pd => pd._id !== product._id);
            newCart = [...remaining, exists];
        }

        setCart(newCart);
        addToDb(product._id)
        setCurrentPage(0); // নতুন পৃষ্ঠায় ডেটা লোড করার জন্য
    }

    const handleClearCart = () => {
        setCart([]);
        deleteShoppingCart();
        setCurrentPage(0); // নতুন পৃষ্ঠায় ডেটা লোড করার জন্য
    }

    const handleItemPerPage = e => {
        const val = parseInt(e.target.value);
        setItemPerPage(val);
        setCurrentPage(0);
    }

    const handlePreviousPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    }

    const handleNextPage = () => {
        if (currentPage < pages.length - 1) {
            setCurrentPage(currentPage + 1);
        }
    }

    return (
        <div className='shop-container'>
            <div className="products-container">
                {products.map(product => 
                    <Product
                        key={product._id}
                        product={product}
                        handleAddToCart={handleAddToCart}
                    />
                )}
            </div>
            <div className="cart-container">
                <Cart
                    cart={cart}
                    handleClearCart={handleClearCart}
                >
                    <Link className='proceed-link' to="/orders">
                        <button className='btn-proceed'>Review Order</button>
                    </Link>
                </Cart>
            </div>

            <div className='pagination'>
                <p>Current Page: {currentPage}</p>
                <button id='previous' onClick={handlePreviousPage}>Previous</button>
                {pages.map(page => 
                    <button 
                        className={currentPage === page ? 'selected' : undefined} 
                        onClick={() => setCurrentPage(page)} 
                        key={page}
                    >
                        {page}
                    </button>
                )}
                <button id='next' onClick={handleNextPage}>Next</button>
                <select onChange={handleItemPerPage} name="" id="">
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                </select>
            </div>
        </div>
    );
};

export default Shop;
